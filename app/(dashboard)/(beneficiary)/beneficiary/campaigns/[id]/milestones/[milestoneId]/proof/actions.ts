"use server"

import { revalidatePath } from "next/cache"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { getMilestoneProofUrl, uploadMilestoneProof } from "@/src/lib/storage"
import { verifyMilestoneProof } from "@/src/lib/langflow"
import { resolveMilestoneVerificationStatus } from "@/src/lib/milestone-verification"
import { db } from "@/src/prisma/db"
import { validateDisbursementDocumentFile } from "@/src/lib/disbursement"
import { canSubmitMilestoneProof } from "@/src/lib/milestone-management"

export async function submitProof(milestoneId: string, formData: FormData) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(milestoneId)
  const milestone = Number.isInteger(id) ? await db.orm.public.Milestone.first({ id }) : null
  if (!milestone) return { success: false, message: "Milestone tidak ditemukan." }

  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  if (!campaign || campaign.communityId !== community.id) {
    return { success: false, message: "Akses ditolak." }
  }

  if (!canSubmitMilestoneProof(milestone)) {
    return {
      success: false,
      message: "Milestone harus dikunci dan berstatus belum dimulai atau perlu bukti ulang sebelum mengirim bukti.",
    }
  }

  const note = String(formData.get("proofNote") ?? "").trim()
  const file = formData.get("proofFile")

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "File bukti wajib diunggah." }
  }
  if (
    !file.type.startsWith("image/") &&
    file.type !== "application/pdf" &&
    file.type !== "application/msword" &&
    file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return { success: false, message: "File bukti harus berupa gambar, PDF, DOC, atau DOCX." }
  }
  if (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const documentError = await validateDisbursementDocumentFile(file)
    if (documentError) return { success: false, message: documentError }
  }

  // 1. Upload to Supabase Storage
  const ext = file.name.split(".").pop() ?? "jpg"
  const storagePath = `${community.id}/${campaign.id}/${milestone.id}/${Date.now()}.${ext}`

  let proofStoragePath: string
  try {
    proofStoragePath = await uploadMilestoneProof(file, storagePath)
  } catch (error) {
    console.error("Proof upload failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengunggah bukti.",
    }
  }

  let proofImageUrl: string
  try {
    proofImageUrl = await getMilestoneProofUrl(proofStoragePath)
  } catch (error) {
    console.error("Proof signed URL creation failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "URL bukti gagal dibuat.",
    }
  }

  // 2. Update milestone with proof data — status becomes PROOF_SUBMITTED
  await db.orm.public.Milestone.where((row) => row.id.eq(id)).update({
    proofImageUrl: proofStoragePath,
    proofNote: note || null,
    status: "PROOF_SUBMITTED",
  })

  revalidatePath(`/beneficiary/campaigns/${campaign.id}/milestones`)

  // 3. Call Langflow AI verification
  const aiResult = await verifyMilestoneProof({
    file,
    proofImageUrl,
    proofNote: note,
    milestoneDescription: milestone.description,
    campaignTitle: campaign.title,
  })

  // 4. Save every AI response, including timeout/error messages, for manual review.
  const nextStatus = resolveMilestoneVerificationStatus(aiResult)
  await db.orm.public.Milestone.where((row) => row.id.eq(id)).update({
    status: nextStatus,
    aiVerificationNote: aiResult.reasoning,
    aiConfidence: aiResult.confidence,
  })

  revalidatePath(`/beneficiary/campaigns/${campaign.id}/milestones`)
  revalidatePath(`/beneficiary/campaigns/${campaign.id}/milestones/${milestone.id}/proof`)
  revalidatePath(`/beneficiary/campaigns/${campaign.id}/disbursement`)

  if (nextStatus === "MANUAL_REVIEW") {
    return {
      success: true,
      message: aiResult.confidence === 0
        ? "Bukti berhasil diunggah, tetapi verifikasi AI gagal. Bukti menunggu pemeriksaan admin."
        : "Bukti berhasil dianalisis dan menunggu pemeriksaan admin.",
    }
  }

  return {
    success: true,
    message: "Bukti terverifikasi oleh AI dan menunggu persetujuan admin.",
  }
}
