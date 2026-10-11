import "server-only"

import { db } from "@/src/prisma/db"
import { getMilestoneProofUrl } from "@/src/lib/storage"
import type { Campaign } from "@/src/lib/site-data"
import { toCategoryLabel } from "@/src/lib/campaign-category"
import {
  sortPublicDisbursementHistory,
  toPublicDisbursementHistoryItem,
  type DisbursedMilestone,
  type PublicDisbursementHistoryItem,
} from "@/src/lib/disbursement-history"

/* =========================================================================
   Server data-access for the PUBLIC campaign pages (list + detail).

   Reads live rows from `db.orm.public.Campaign` (Prisma 8) and maps them to
   the `Campaign` shape the campaign card / detail components already consume.
   Only APPROVED + ACTIVE campaigns are exposed publicly, newest first.
   ========================================================================= */

const DEFAULT_COVER = "/background-hero.png"

// Categories the public filter understands. Anything unknown falls back to
// "Donasi Umum" so the UI never renders an orphan filter chip.
export const CAMPAIGN_CATEGORIES = [
  "Zakat",
  "Donasi Umum",
  "Wakaf",
  "Tanggap Bencana",
] as const

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number]

// The DB stores category as an enum CODE (ZAKAT/DONASI_UMUM/...); the card and
// filter use Indonesian labels. Convert here.
function normalizeCategory(value: string | null | undefined): CampaignCategory {
  return toCategoryLabel(value) as CampaignCategory
}

// wei (18-decimal string) -> a plain BNB number the card math can use.
// Kept lossy-but-safe: BNB amounts on testnet are small, well within Number.
function weiToBnbNumber(value: string | null | undefined): number {
  if (!value) return 0
  try {
    const wei = BigInt(value)
    // Scale by 1e6 first to keep 6 fractional digits, then divide back.
    const scaled = Number(
      (wei * BigInt(1_000_000)) / BigInt("1000000000000000000")
    )
    return scaled / 1_000_000
  } catch {
    return 0
  }
}

// The card's `satuan` union is BNB | USDT; the DB `currency` is free text.
function toSatuan(currency: string | null | undefined): Campaign["satuan"] {
  return (currency ?? "").toUpperCase() === "USDT" ? "USDT" : "BNB"
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "MZ"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// The shape returned by `db.orm.public.Campaign` reads we perform below.
type CampaignRow = {
  id: number
  communityId: number | null
  title: string
  organizerName: string
  category: string
  image: string | null
  location: string | null
  summary: string | null
  daysLeft: number
  raisedAmountWei: string
  targetAmountWei: string
  currency: string
  donorCount: number
  reviewStatus: string
  source: "AI_MOCK" | "MANUAL"
}

function toCard(row: CampaignRow): Campaign {
  const organizer =
    row.source === "AI_MOCK"
      ? "Admin Mizan"
      : row.organizerName || "Komunitas Mizan"

  return {
    id: String(row.id),
    kategori: normalizeCategory(row.category),
    judul: row.title,
    penyelenggara: organizer,
    lokasi: row.location ?? "Indonesia",
    terkumpul: weiToBnbNumber(row.raisedAmountWei),
    target: weiToBnbNumber(row.targetAmountWei),
    satuan: toSatuan(row.currency),
    donatur: row.donorCount,
    sisaHari: row.daysLeft,
    terverifikasi: row.reviewStatus === "APPROVED",
    ringkas: row.summary ?? "",
    gambar: row.image || DEFAULT_COVER,
    komunitas: {
      id: row.communityId ? String(row.communityId) : undefined,
      nama: organizer,
      tipe:
        row.source === "AI_MOCK" ? "Admin Mizan" : "Komunitas terverifikasi",
      bio: row.summary
        ? row.summary
        : `${organizer} mengelola penyaluran kampanye ini secara transparan di on-chain.`,
      inisial: initials(organizer),
    },
  }
}

const PUBLIC_SELECT = [
  "id",
  "communityId",
  "title",
  "organizerName",
  "category",
  "image",
  "location",
  "summary",
  "daysLeft",
  "raisedAmountWei",
  "targetAmountWei",
  "currency",
  "donorCount",
  "reviewStatus",
  "source",
] as const

/**
 * All publicly visible campaigns (APPROVED + ACTIVE), newest first.
 */
export async function getPublicCampaigns(): Promise<Campaign[]> {
  const rows = await db.orm.public.Campaign.select(...PUBLIC_SELECT)
    .where({ reviewStatus: "APPROVED", status: "ACTIVE" })
    .orderBy((campaign) => campaign.createdAt.desc())
    .all()

  return rows.map((row) => toCard(row as CampaignRow))
}

/**
 * A single public campaign by its numeric id. Returns null when the id is
 * invalid, the campaign does not exist, or it is not publicly visible.
 */
export async function getPublicCampaignById(
  id: string
): Promise<Campaign | null> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) return null

  const row = await db.orm.public.Campaign.select(...PUBLIC_SELECT, "status")
    .where({ id: numId })
    .first()

  if (!row) return null
  if (
    row.reviewStatus !== "APPROVED" ||
    !["ACTIVE", "COMPLETED", "CLOSED"].includes(row.status)
  )
    return null

  return toCard(row as CampaignRow)
}

export type PublicOrganization = {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  walletAddress: string
  registrationNumber: string | null
  legalDocumentUrl: string | null
  verificationStatus: string
  campaigns: Campaign[]
  disbursementHistory: PublicDisbursementHistoryItem[]
}

export async function getPublicDisbursementHistoryForCampaign(
  campaignId: number
): Promise<PublicDisbursementHistoryItem[]> {
  const campaign = await db.orm.public.Campaign.first({ id: campaignId })
  if (!campaign) return []

  const milestones = await db.orm.public.Milestone.where({
    campaignId,
    status: "DISBURSED",
  })
    .orderBy((milestone) => milestone.updatedAt.desc())
    .all()

  const history = await Promise.all(
    milestones.map(async (milestone) => {
      const proofUrl = milestone.proofImageUrl
        ? await getMilestoneProofUrl(milestone.proofImageUrl).catch((error) => {
            console.error("Public milestone proof URL refresh failed:", error)
            return null
          })
        : null

      return toPublicDisbursementHistoryItem(
        milestone as DisbursedMilestone,
        campaign.currency,
        proofUrl
      )
    })
  )

  return sortPublicDisbursementHistory(history)
}

export async function getPublicDisbursementHistoryForOrganization(
  communityId: number
): Promise<PublicDisbursementHistoryItem[]> {
  const campaigns = await db.orm.public.Campaign.where({
    communityId,
    reviewStatus: "APPROVED",
  }).all()
  const histories = await Promise.all(
    campaigns.map(async (campaign) => {
      const history = await getPublicDisbursementHistoryForCampaign(campaign.id)
      return history.map((item) => ({ ...item, campaignTitle: campaign.title }))
    })
  )
  return sortPublicDisbursementHistory(histories.flat())
}

export async function getPublicOrganizationById(
  id: string
): Promise<PublicOrganization | null> {
  const organizationId = Number(id)
  if (!Number.isInteger(organizationId) || organizationId <= 0) return null

  const community = await db.orm.public.Community.first({ id: organizationId })
  if (!community) return null

  const campaignRows = await db.orm.public.Campaign.select(...PUBLIC_SELECT)
    .where({
      communityId: organizationId,
      reviewStatus: "APPROVED",
      status: "ACTIVE",
    })
    .orderBy((campaign) => campaign.createdAt.desc())
    .all()

  return {
    id: String(community.id),
    name: community.name,
    description: community.description,
    logoUrl: community.logoUrl,
    websiteUrl: community.websiteUrl,
    contactEmail: community.contactEmail,
    contactPhone: community.contactPhone,
    address: community.address,
    walletAddress: community.walletAddress,
    registrationNumber: community.registrationNumber,
    legalDocumentUrl: community.legalDocumentUrl,
    verificationStatus: community.verificationStatus,
    campaigns: campaignRows.map((row) => toCard(row as CampaignRow)),
    disbursementHistory:
      await getPublicDisbursementHistoryForOrganization(organizationId),
  }
}
