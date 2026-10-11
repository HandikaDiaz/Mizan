"use server"

import { revalidatePath } from "next/cache"

import { requireAdminSession } from "@/src/lib/beneficiary/access"
import { getDisbursementDocumentUrl, getMilestoneProofUrl } from "@/src/lib/storage"
import {
  approveDisbursementRequestOnChain,
  executeDisbursementOnChain,
  reconcileDisbursementOnChain,
  retryDisbursementOnChain,
} from "@/src/lib/disbursement-chain"
import type { DisbursementRequestStatus } from "@/src/lib/disbursement-workflow"
import { db } from "@/src/prisma/db"

export type AdminDisbursementItem = {
  id: string
  milestoneId: string
  campaignId: string
  campaignTitle: string
  organizerName: string
  milestoneOrder: number
  description: string
  amountWei: string
  currency: string
  status: DisbursementRequestStatus
  proofUrl: string | null
  proofNote: string | null
  aiVerificationNote: string | null
  aiConfidence: number | null
  disbursementRequestedAt: string | null
  disbursementTxHash: string | null
  requestDocumentUrl: string | null
  langflowDecision: string | null
  transactionHash: string | null
  verificationTransactionHash: string | null
  chainError: string | null
}

export async function getAdminDisbursements(): Promise<AdminDisbursementItem[]> {
  await requireAdminSession()
  const requests = await db.orm.public.DisbursementRequest
    .orderBy((row) => row.updatedAt.desc())
    .all()

  return Promise.all(requests.map(async (request) => {
    const milestone = await db.orm.public.Milestone.first({ id: request.milestoneId })
    const campaign = milestone
      ? await db.orm.public.Campaign.first({ id: milestone.campaignId })
      : null
    const proofUrl = milestone?.proofImageUrl
      ? await getMilestoneProofUrl(milestone.proofImageUrl).catch((error) => {
          console.error("Admin proof URL refresh failed:", error)
          return null
        })
      : null
    const requestDocumentUrl = await getDisbursementDocumentUrl(request.documentStoragePath).catch((error) => {
      console.error("Admin disbursement document URL refresh failed:", error)
      return null
    })

    return {
      id: String(request.id),
      milestoneId: String(request.milestoneId),
      campaignId: String(milestone?.campaignId ?? ""),
      campaignTitle: campaign?.title ?? "Kampanye tidak ditemukan",
      organizerName: campaign?.organizerName ?? "—",
      milestoneOrder: milestone?.order ?? 0,
      description: milestone?.description ?? "Milestone tidak ditemukan",
      amountWei: milestone?.amountWei ?? request.requestedAmountWei,
      currency: campaign?.currency ?? "BNB",
      status: request.status as DisbursementRequestStatus,
      proofUrl,
      proofNote: milestone?.proofNote ?? null,
      aiVerificationNote: milestone?.aiVerificationNote ?? null,
      aiConfidence: milestone?.aiConfidence ?? null,
      disbursementRequestedAt: milestone?.disbursementRequestedAt ?? null,
      disbursementTxHash: milestone?.disbursementTxHash ?? null,
      requestDocumentUrl,
      langflowDecision: request.langflowDecision ?? null,
      transactionHash: request.transactionHash ?? null,
      verificationTransactionHash: request.verificationTransactionHash ?? null,
      chainError: request.chainError ?? null,
    }
  }))
}

function parseRequestId(id: string) {
  const requestId = Number(id)
  if (!Number.isInteger(requestId) || requestId <= 0) throw new Error("ID pengajuan tidak valid.")
  return requestId
}

async function requestContext(id: string) {
  await requireAdminSession()
  const requestId = parseRequestId(id)
  const request = await db.orm.public.DisbursementRequest.first({ id: requestId })
  if (!request) throw new Error("Pengajuan pencairan tidak ditemukan.")
  const milestone = await db.orm.public.Milestone.first({ id: request.milestoneId })
  return { request, milestone }
}

function revalidateDisbursementPaths(campaignId: number | null | undefined) {
  revalidatePath("/admin/penyaluran")
  if (campaignId) {
    revalidatePath(`/beneficiary/campaigns/${campaignId}/milestones`)
    revalidatePath(`/beneficiary/campaigns/${campaignId}/disbursement`)
  }
}

export async function approveDisbursementRequest(id: string) {
  try {
    const { request, milestone } = await requestContext(id)
    const updated = await approveDisbursementRequestOnChain(request.id)
    revalidateDisbursementPaths(milestone?.campaignId)
    return { success: true, message: "Pengajuan disetujui dan milestone siap dicairkan.", status: updated?.status ?? "ADMIN_APPROVED" }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Pengajuan gagal disetujui." }
  }
}

export async function rejectDisbursementRequest(id: string) {
  try {
    const { request, milestone } = await requestContext(id)
    if (request.status !== "AI_VERIFIED" && request.status !== "MANUAL_REVIEW") {
      throw new Error("Pengajuan tidak berada pada status yang dapat ditolak.")
    }
    const updated = await db.orm.public.DisbursementRequest.where({ id: request.id }).update({
      status: "REJECTED",
      activeRequestKey: null,
      chainError: null,
    })
    if (milestone) {
      await db.orm.public.Milestone.where({ id: milestone.id }).update({ status: "REJECTED" })
    }
    revalidateDisbursementPaths(milestone?.campaignId)
    return { success: true, message: "Pengajuan ditolak dan dapat diajukan ulang setelah bukti diperbaiki.", status: updated?.status ?? "REJECTED" }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Pengajuan gagal ditolak." }
  }
}

export async function executeDisbursement(id: string) {
  try {
    const { request, milestone } = await requestContext(id)
    const updated = await executeDisbursementOnChain(request.id)
    revalidateDisbursementPaths(milestone?.campaignId)
    const status = updated?.status ?? "CHAIN_PENDING"
    return {
      success: true,
      message: status === "DISBURSED"
        ? "Transaksi pencairan berhasil dikonfirmasi."
        : "Transaksi sudah dikirim dan masih menunggu receipt.",
      status,
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Pencairan gagal diproses." }
  }
}

export async function retryDisbursement(id: string) {
  try {
    const { request, milestone } = await requestContext(id)
    const updated = await retryDisbursementOnChain(request.id)
    revalidateDisbursementPaths(milestone?.campaignId)
    const status = updated?.status ?? "CHAIN_PENDING"
    return {
      success: true,
      message: status === "DISBURSED"
        ? "Retry pencairan berhasil dikonfirmasi."
        : "Retry sudah dikirim dan masih menunggu receipt.",
      status,
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Retry pencairan gagal." }
  }
}

export async function reconcileDisbursement(id: string) {
  try {
    const { request, milestone } = await requestContext(id)
    const updated = await reconcileDisbursementOnChain(request.id)
    revalidateDisbursementPaths(milestone?.campaignId)
    const status = updated?.status ?? "CHAIN_PENDING"
    return { success: true, message: status === "DISBURSED" ? "Transaksi terkonfirmasi dan payout dicatat." : "Transaksi masih menunggu receipt.", status }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Rekonsiliasi gagal." }
  }
}

// Compatibility aliases for existing imports while the admin page migrates to request IDs.
export async function approveMilestoneDisbursement(id: string) {
  return approveDisbursementRequest(id)
}

export async function rejectMilestoneProof(id: string) {
  return rejectDisbursementRequest(id)
}

export async function markMilestoneDisbursed(id: string) {
  return executeDisbursement(id)
}
