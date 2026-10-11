"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CampaignFormState } from "@/src/lib/campaign-workflow"
import { decimalBnbToWei } from "@/src/lib/payments/validation"
import { db } from "@/src/prisma/db"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { campaignInputSchema } from "@/src/lib/beneficiary/validation"
import { formatCampaignCategory } from "@/src/lib/beneficiary/campaign-presentation"
import { getCampaignRevalidationPaths } from "@/src/lib/campaign-paths"

// ── Types ──────────────────────────────────────────────────────────────────

export type BeneficiaryCampaignStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "AKTIF"
  | "SELESAI"
  | "DITUTUP"
  | "DITOLAK"

export type BeneficiaryCampaign = {
  id: string
  title: string
  description: string
  category: string | null
  organizerName: string
  recipientWallet: string | null
  targetAmountWei: string
  raisedAmountWei: string
  currency: string
  donorCount: number
  progressPct: number
  reviewStatus: string
  /** Next incomplete milestone label. */
  nextMilestone: string | null
  status: BeneficiaryCampaignStatus
  createdAt: string
  updatedAt: string
}

export type BeneficiaryCampaignFormState = CampaignFormState

// ── Form validation ────────────────────────────────────────────────────────

const VALID_CATEGORIES = ["Zakat", "Donasi Umum", "Wakaf", "Tanggap Bencana"] as const
type ValidCategory = (typeof VALID_CATEGORIES)[number]

function shortText(value: FormDataEntryValue | null, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function validateBeneficiaryForm(formData: FormData): {
  errors: Record<string, string>
  data: {
    title: string
    description: string
    category: ValidCategory
    organizerName: string
    recipientWallet: string
    targetAmountWei: string
    targetBnb: number
    currency: string
  }
} {
  const errors: Record<string, string> = {}

  const title = shortText(formData.get("title"), 160)
  const description = shortText(formData.get("description"), 2000)
  const category = shortText(formData.get("category"), 60)
  const organizerName = shortText(formData.get("organizerName"), 160)
  const recipientWallet = shortText(formData.get("recipientWallet"), 42)
  const targetInput = shortText(formData.get("target"), 40)
  const currency = shortText(formData.get("currency"), 10) || "BNB"

  if (!title) errors.title = "Judul kampanye wajib diisi."
  if (!description) errors.description = "Deskripsi kampanye wajib diisi."
  if (!VALID_CATEGORIES.includes(category as ValidCategory))
    errors.category = "Pilih kategori yang tersedia."
  if (!organizerName) errors.organizerName = "Nama penyelenggara wajib diisi."
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipientWallet))
    errors.recipientWallet = "Wallet penerima harus address EVM yang valid (0x…)."

  const targetAmountWei = decimalBnbToWei(targetInput)
  if (!targetAmountWei || targetAmountWei === "0")
    errors.target = "Target dana harus lebih besar dari nol."

  return {
    errors,
    data: {
      title,
      description,
      category: (VALID_CATEGORIES.includes(category as ValidCategory)
        ? category
        : "Donasi Umum") as ValidCategory,
      organizerName,
      recipientWallet,
      targetAmountWei: targetAmountWei ?? "0",
      targetBnb: Number(targetInput) || 0,
      currency,
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Maps the DB (reviewStatus × status) pair to the beneficiary-facing status label.
 * Extend this mapping once the Milestone model is added.
 */
function toBeneficiaryStatus(
  reviewStatus: string,
  status: string,
): BeneficiaryCampaignStatus {
  if (reviewStatus === "AI_DRAFT") return "DRAFT"
  if (reviewStatus === "PENDING_REVIEW") return "PENDING_REVIEW"
  if (reviewStatus === "REJECTED") return "DITOLAK"
  if (status === "COMPLETED") return "SELESAI"
  if (status === "CLOSED") return "DITUTUP"
  // reviewStatus === "APPROVED" && status === "ACTIVE"
  return "AKTIF"
}

/**
 * Computes progress as integer percent (0–100).
 * Falls back to 0 when target is zero.
 */
function progressPct(raisedWei: string, targetWei: string): number {
  const raised = BigInt(raisedWei || "0")
  const target = BigInt(targetWei || "0")
  if (target === BigInt(0)) return 0
  const pct = (raised * BigInt(100)) / target
  return Math.min(100, Number(pct))
}

function toPresentation(row: {
  id: number
  title: string
  organizerName: string
  recipientWallet: string | null
  targetAmountWei: string
  raisedAmountWei: string
  currency: string
  donorCount: number
  reviewStatus: string
  status: string
  aiDraft: unknown | null
  category: string | null
  aiReference: string | null
  createdAt: string
  updatedAt: string
}): BeneficiaryCampaign {
  // Extract description and category stored inside aiDraft JSON by the beneficiary form.
  // TODO(schema): migrate to dedicated `description` and `category` columns.
  const draft =
    row.aiDraft && typeof row.aiDraft === "object" ? (row.aiDraft as Record<string, unknown>) : {}
  const description = typeof draft.description === "string" ? draft.description : ""
  const category = formatCampaignCategory(
    typeof draft.category === "string" && draft.category ? draft.category : row.category ?? "DONASI_UMUM",
  )
  return {
    id: String(row.id),
    title: row.title,
    description,
    category,
    organizerName: row.organizerName,
    recipientWallet: row.recipientWallet,
    targetAmountWei: row.targetAmountWei,
    raisedAmountWei: row.raisedAmountWei,
    currency: row.currency,
    donorCount: row.donorCount,
    progressPct: progressPct(row.raisedAmountWei, row.targetAmountWei),
    reviewStatus: row.reviewStatus,
    nextMilestone: null,
    status: toBeneficiaryStatus(row.reviewStatus, row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getBeneficiaryCampaigns(): Promise<BeneficiaryCampaign[]> {
  const { community } = await requireBeneficiaryCommunity()
  if (!community) {
    return []
  }

  const rows = await db.orm.public.Campaign
    .where({ communityId: community.id })
    .orderBy((c) => c.createdAt.desc())
    .all()

  return Promise.all(
    rows.map(async (row) => {
      const milestones = await db.orm.public.Milestone
        .where({ campaignId: row.id })
        .all()
      const presentation = toPresentation(row)
      return {
        ...presentation,
        nextMilestone:
          milestones.find((milestone) => milestone.status !== "DISBURSED")?.description ?? null,
      }
    }),
  )
}

export async function getBeneficiaryCampaignById(
  id: string,
): Promise<BeneficiaryCampaign | null> {
  const { community } = await requireBeneficiaryCommunity()
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) return null
  const row = await db.orm.public.Campaign.first({ id: numId })
  if (!row || row.communityId !== community.id) return null
  const milestones = await db.orm.public.Milestone.where({ campaignId: row.id }).all()
  return row
    ? {
      ...toPresentation(row),
      nextMilestone: milestones.find((milestone) => milestone.status !== "DISBURSED")?.description ?? null,
    }
    : null
}

/** Create a new campaign as DRAFT owned by the current beneficiary org. */
export async function createBeneficiaryCampaign(
  _prev: BeneficiaryCampaignFormState,
  formData: FormData,
): Promise<BeneficiaryCampaignFormState> {
  const { community } = await requireBeneficiaryCommunity()
  const rawMilestones = formData.getAll("milestones")
    .map((value) => {
      try {
        return JSON.parse(String(value)) as { description: string; amountWei: string }
      } catch {
        return null
      }
    })
    .filter((value): value is { description: string; amountWei: string } => value !== null)
  const parsed = campaignInputSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    targetAmountWei: formData.get("targetAmountWei"),
    recipientWallet: formData.get("recipientWallet") || community.walletAddress,
    currency: formData.get("currency") || "BNB",
    image: formData.get("image") || undefined,
    location: formData.get("location") || undefined,
    daysLeft: formData.get("daysLeft") || 0,
    milestones: rawMilestones,
  })
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali isian formulir.",
      errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])),
    }
  }

  const data = parsed.data
  const campaign = await db.transaction(async (transaction) => {
    const created = await transaction.orm.public.Campaign.create({
      title: data.title,
      organizerName: community.name,
      category: data.category as "ZAKAT" | "DONASI_UMUM" | "WAKAF" | "BENCANA",
      communityId: community.id,
      raisedAmountWei: "0",
      targetAmountWei: data.targetAmountWei,
      currency: data.currency,
      donorCount: 0,
      status: "ACTIVE",
      source: "MANUAL",
      reviewStatus: "PENDING_REVIEW",
      aiDraft: { description: data.description, category: data.category, createdBy: "BENEFICIARY" },
      recipientWallet: data.recipientWallet.toLowerCase(),
      image: data.image || null,
      location: data.location || null,
      summary: data.description,
      daysLeft: data.daysLeft,
      fundingDeadline: new Date(Date.now() + data.daysLeft * 24 * 60 * 60 * 1000).toISOString(),
    })

    await Promise.all(data.milestones.map((milestone, index) =>
      transaction.orm.public.Milestone.create({
        campaignId: created.id,
        order: index + 1,
        description: milestone.description,
        amountWei: milestone.amountWei,
        status: "PENDING",
      }),
    ))
    return created
  })

  for (const path of getCampaignRevalidationPaths()) revalidatePath(path)
  redirect(`/beneficiary/campaigns/${campaign.id}?created=1`)
}

/** Update an existing DRAFT campaign (only allowed while status is AI_DRAFT). */
export async function updateBeneficiaryCampaign(
  id: string,
  _prev: BeneficiaryCampaignFormState,
  formData: FormData,
): Promise<BeneficiaryCampaignFormState> {
  const { errors, data } = validateBeneficiaryForm(formData)
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Periksa kembali isian formulir.", errors }
  }

  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0)
    return { success: false, message: "ID kampanye tidak valid." }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) return { success: false, message: "Kampanye tidak ditemukan." }
  if (existing.reviewStatus !== "AI_DRAFT" && existing.reviewStatus !== "REJECTED")
    return {
      success: false,
      message: "Kampanye hanya dapat diedit saat berstatus Draft atau Ditolak.",
    }

  // TODO(auth): verify the campaign belongs to the current user's Community
  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    title: data.title,
    organizerName: data.organizerName,
    targetAmountWei: data.targetAmountWei,
    currency: data.currency,
    recipientWallet: data.recipientWallet.toLowerCase(),
    aiDraft: {
      description: data.description,
      category: data.category,
      targetBnb: data.targetBnb,
      recipientWallet: data.recipientWallet,
      createdBy: "BENEFICIARY",
    },
    // If previously rejected, move back to draft so the admin can re-review
    reviewStatus: existing.reviewStatus === "REJECTED" ? "AI_DRAFT" : existing.reviewStatus,
    rejectionReason: existing.reviewStatus === "REJECTED" ? null : existing.rejectionReason,
  })

  revalidatePath("/beneficiary/campaigns")
  redirect("/beneficiary/campaigns")
}

/** Delete a DRAFT campaign. Campaigns already submitted/active cannot be deleted. */
export async function deleteBeneficiaryCampaign(
  id: string,
): Promise<BeneficiaryCampaignFormState> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0)
    return { success: false, message: "ID kampanye tidak valid." }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) return { success: false, message: "Kampanye tidak ditemukan." }
  if (existing.reviewStatus !== "AI_DRAFT")
    return {
      success: false,
      message: "Hanya kampanye berstatus Draft yang dapat dihapus.",
    }

  // TODO(auth): verify ownership before deleting
  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).delete()
  revalidatePath("/beneficiary/campaigns")
  return { success: true, message: "Kampanye berhasil dihapus." }
}

/**
 * Submit a campaign for admin review.
 * Transition: DRAFT → PENDING_REVIEW
 */
export async function submitForReview(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0)
    return { success: false, message: "ID kampanye tidak valid." }

  const row = await db.orm.public.Campaign.first({ id: numId })
  if (!row) return { success: false, message: "Kampanye tidak ditemukan." }
  if (row.reviewStatus !== "AI_DRAFT")
    return { success: false, message: "Hanya kampanye draft yang dapat diajukan untuk review." }

  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    reviewStatus: "PENDING_REVIEW",
  })
  for (const path of getCampaignRevalidationPaths()) revalidatePath(path)
  return { success: true, message: "Kampanye berhasil diajukan untuk review admin." }
}
