"use server"

import { revalidatePath } from "next/cache"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { getChainConfig } from "@/src/lib/chain/config"
import { getCampaignSummary } from "@/src/lib/chain/vault-service"
import { decimalBnbToWei } from "@/src/lib/payments/validation"
import {
  getDisbursementDocumentUrl,
  getMilestoneProofUrl,
} from "@/src/lib/storage"
import { db } from "@/src/prisma/db"
import {
  canEditMilestone,
  canRequestMilestoneDisbursement,
} from "@/src/lib/milestone-management"
import { z } from "zod"

const milestoneInputSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi milestone wajib diisi."),
  amount: z.string().trim().min(1, "Nominal milestone wajib diisi."),
})

type MilestoneActionResult = { success: boolean; message: string }
type ParsedMilestoneInput =
  | { value: { description: string; amountWei: string } }
  | { error: string }

const readMilestoneInput = (formData: FormData): ParsedMilestoneInput => {
  const parsed = milestoneInputSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data milestone tidak valid." }

  const amountWei = decimalBnbToWei(parsed.data.amount)
  if (!amountWei || amountWei === "0") return { error: "Nominal milestone harus lebih besar dari nol." }

  return { value: { description: parsed.data.description, amountWei } }
}

async function getOwnedMilestone(milestoneId: string) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(milestoneId)
  const milestone = Number.isInteger(id) && id > 0
    ? await db.orm.public.Milestone.first({ id })
    : null
  if (!milestone) return null

  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  if (!campaign || campaign.communityId !== community.id) return null
  return { community, campaign, milestone }
}

export async function getMilestones(campaignId: string) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(campaignId)
  if (!Number.isInteger(id) || id <= 0) return null
  const campaign = await db.orm.public.Campaign.first({ id })
  if (!campaign || campaign.communityId !== community.id) return null
  let chainSummary: {
    fundedAmountWei: string
    reservedAmountWei: string
    releasedAmountWei: string
    availableAmountWei: string
  } | null = null
  if (
    campaign.onchainStatus === "REGISTERED" &&
    campaign.contractAddress &&
    campaign.contractCampaignId &&
    /^\d+$/.test(campaign.contractCampaignId)
  ) {
    try {
      const config = getChainConfig()
      if (
        campaign.chainId === config.chainId &&
        campaign.contractAddress.toLowerCase() === config.contractAddress.toLowerCase()
      ) {
        const [funded, reserved, released, available] = await getCampaignSummary(
          BigInt(campaign.contractCampaignId),
        )
        chainSummary = {
          fundedAmountWei: funded.toString(),
          reservedAmountWei: reserved.toString(),
          releasedAmountWei: released.toString(),
          availableAmountWei: available.toString(),
        }
      }
    } catch (error) {
      console.error("Campaign escrow summary refresh failed:", error)
    }
  }
  const milestones = await db.orm.public.Milestone.where({ campaignId: id }).all()
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order)
  const milestonesWithFreshUrls = await Promise.all(
    sortedMilestones.map(async (milestone) => ({
      ...milestone,
      disbursementRequest: await db.orm.public.DisbursementRequest
        .where({ milestoneId: milestone.id })
        .orderBy((request) => request.createdAt.desc())
        .first()
        .then((request) =>
          request
            ? {
                id: request.id,
                status: request.status,
                requestedAmountWei: request.requestedAmountWei,
                transactionHash: request.transactionHash,
                verificationTransactionHash: request.verificationTransactionHash,
                chainError: request.chainError,
                blockNumber: request.blockNumber?.toString() ?? null,
                createdAt: request.createdAt,
              }
            : null,
        ),
      proofImageUrl: milestone.proofImageUrl
        ? await (milestone.proofImageUrl.startsWith("disbursement:")
            ? getDisbursementDocumentUrl(milestone.proofImageUrl.slice("disbursement:".length))
            : getMilestoneProofUrl(milestone.proofImageUrl)
          ).catch((error) => {
            console.error("Milestone proof URL refresh failed:", error)
            return null
          })
        : null,
    })),
  )
  return { campaign, milestones: milestonesWithFreshUrls, chainSummary }
}

export async function requestMilestoneDisbursement(milestoneId: string) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(milestoneId)
  const milestone = Number.isInteger(id) ? await db.orm.public.Milestone.first({ id }) : null
  if (!milestone) return { success: false, message: "Milestone tidak ditemukan." }
  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  if (!campaign || campaign.communityId !== community.id) return { success: false, message: "Akses ditolak." }
  if (!canRequestMilestoneDisbursement(milestone)) {
    return {
      success: false,
      message: "Milestone harus dikunci dan terverifikasi AI sebelum diajukan untuk pencairan.",
    }
  }
  return {
    success: true,
    message: "Milestone siap diajukan untuk pencairan.",
  }
}

export async function createMilestone(
  campaignId: string,
  _previousState: MilestoneActionResult,
  formData: FormData,
): Promise<MilestoneActionResult> {
  try {
    const { community } = await requireBeneficiaryCommunity()
    const id = Number(campaignId)
    const campaign = Number.isInteger(id) && id > 0
      ? await db.orm.public.Campaign.first({ id })
      : null
    if (!campaign || campaign.communityId !== community.id) {
      return { success: false, message: "Akses kampanye ditolak." }
    }

    const input = readMilestoneInput(formData)
    if ("error" in input) return { success: false, message: input.error }

    const milestones = await db.orm.public.Milestone.where({ campaignId: id }).all()
    const nextOrder = milestones.reduce((max, milestone) => Math.max(max, milestone.order), 0) + 1
    await db.orm.public.Milestone.create({
      campaignId: id,
      order: nextOrder,
      description: input.value.description,
      amountWei: input.value.amountWei,
      status: "PENDING",
    })

    revalidatePath(`/beneficiary/campaigns/${id}/milestones`)
    return { success: true, message: "Milestone berhasil ditambahkan." }
  } catch (error) {
    console.error("Gagal membuat milestone", error)
    return { success: false, message: "Milestone gagal ditambahkan." }
  }
}

export async function updateMilestone(
  milestoneId: string,
  _previousState: MilestoneActionResult,
  formData: FormData,
): Promise<MilestoneActionResult> {
  try {
    const result = await getOwnedMilestone(milestoneId)
    if (!result) return { success: false, message: "Milestone tidak ditemukan." }
    if (!canEditMilestone(result.milestone)) {
      return { success: false, message: "Milestone sudah dikunci dan tidak dapat diedit." }
    }

    const input = readMilestoneInput(formData)
    if ("error" in input) return { success: false, message: input.error }

    await db.orm.public.Milestone.where({ id: result.milestone.id }).update({
      description: input.value.description,
      amountWei: input.value.amountWei,
    })
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/milestones`)
    return { success: true, message: "Milestone berhasil diperbarui." }
  } catch (error) {
    console.error("Gagal memperbarui milestone", error)
    return { success: false, message: "Milestone gagal diperbarui." }
  }
}

export async function deleteMilestone(milestoneId: string): Promise<MilestoneActionResult> {
  try {
    const result = await getOwnedMilestone(milestoneId)
    if (!result) return { success: false, message: "Milestone tidak ditemukan." }
    if (!canEditMilestone(result.milestone)) {
      return { success: false, message: "Milestone sudah dikunci dan tidak dapat dihapus." }
    }

    await db.orm.public.Milestone.where({ id: result.milestone.id }).delete()
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/milestones`)
    return { success: true, message: "Milestone berhasil dihapus." }
  } catch (error) {
    console.error("Gagal menghapus milestone", error)
    return { success: false, message: "Milestone gagal dihapus." }
  }
}

export async function lockMilestone(milestoneId: string): Promise<MilestoneActionResult> {
  try {
    const result = await getOwnedMilestone(milestoneId)
    if (!result) return { success: false, message: "Milestone tidak ditemukan." }
    if (!canEditMilestone(result.milestone)) {
      return { success: false, message: "Milestone sudah dikunci." }
    }

    await db.orm.public.Milestone.where({ id: result.milestone.id }).update({
      lockedAt: new Date().toISOString(),
    })
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/milestones`)
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/disbursement`)
    return { success: true, message: "Milestone dikunci dan tidak dapat diedit atau dihapus lagi." }
  } catch (error) {
    console.error("Gagal mengunci milestone", error)
    return { success: false, message: "Milestone gagal dikunci." }
  }
}
