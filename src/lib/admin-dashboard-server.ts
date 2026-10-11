import "server-only"

import { db } from "@/src/prisma/db"
import type { ActivityItem, StatItem } from "@/src/lib/dashboard-data"
import { formatWeiBnb } from "@/src/lib/dashboard-server"

/* =========================================================================
   Real-time admin dashboard data.

   Stats and the activity feed are computed live from Campaign +
   CampaignPayment rows, replacing the static ADMIN_STATS / ADMIN_ACTIVITIES
   placeholders.
   ========================================================================= */

const WEI = BigInt("1000000000000000000")

function shortenHash(hash: string): string {
  if (hash.length <= 12) return hash
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

// A compact Indonesian "time ago" label.
function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"

  const diffMs = Date.now() - then
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)

  if (sec < 60) return "baru saja"
  if (min < 60) return `${min} menit lalu`
  if (hour < 24) return `${hour} jam lalu`
  if (day < 30) return `${day} hari lalu`

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(then))
}

function bnb(weiTotal: bigint): string {
  return formatWeiBnb(weiTotal.toString())
}

/**
 * Live platform totals for the admin stat cards.
 * - terkumpul: sum of CONFIRMED payment amounts
 * - tersalur: sum of DISBURSED milestone amounts (0 until milestones are used)
 * - kampanye aktif: APPROVED + ACTIVE campaigns
 * - total donatur: distinct donors across CONFIRMED payments
 */
export async function getAdminStats(): Promise<StatItem[]> {
  const [campaigns, payments] = await Promise.all([
    db.orm.public.Campaign.all(),
    db.orm.public.CampaignPayment.all(),
  ])

  const confirmed = payments.filter((p) => p.status === "CONFIRMED")

  const totalRaisedWei = confirmed.reduce(
    (total, p) => total + BigInt(p.amountWei || "0"),
    BigInt(0)
  )

  const activeCampaigns = campaigns.filter(
    (c) => c.reviewStatus === "APPROVED" && c.status === "ACTIVE"
  ).length

  const totalDonors = new Set(confirmed.map((p) => p.donorId)).size

  // Disbursed funds come from milestones once that flow is live. The Milestone
  // table may not be fully migrated yet, so guard and default to 0.
  let totalDisbursedWei = BigInt(0)
  try {
    // Select only the columns we need — the Milestone table may not be fully
    // migrated yet, so avoid reading columns that might not exist.
    const milestones = await db.orm.public.Milestone.select(
      "amountWei",
      "status"
    )
      .where({ status: "DISBURSED" })
      .all()
    totalDisbursedWei = milestones.reduce(
      (total, m) => total + BigInt(m.amountWei || "0"),
      BigInt(0)
    )
  } catch {
    totalDisbursedWei = BigInt(0)
  }

  return [
    {
      label: "Total terkumpul",
      value: bnb(totalRaisedWei),
      unit: "BNB",
      icon: "Wallet",
    },
    {
      label: "Total tersalur",
      value: bnb(totalDisbursedWei),
      unit: "BNB",
      icon: "ArrowUpRight",
    },
    {
      label: "Kampanye aktif",
      value: String(activeCampaigns),
      unit: "kampanye",
      icon: "Megaphone",
    },
    {
      label: "Total donatur",
      value: String(totalDonors),
      unit: "orang",
      icon: "Users",
    },
  ]
}

type ActivityWithTime = ActivityItem & { _ts: number }

/**
 * Live activity feed merging recent payments and campaign creations,
 * newest first. `limit` caps the number of rows returned.
 */
export async function getAdminActivities(limit = 12): Promise<ActivityItem[]> {
  const [campaigns, payments] = await Promise.all([
    db.orm.public.Campaign.orderBy((c) => c.createdAt.desc())
      .limit(20)
      .all(),
    db.orm.public.CampaignPayment.orderBy((p) => p.createdAt.desc())
      .limit(20)
      .all(),
  ])

  const campaignTitle = new Map(campaigns.map((c) => [c.id, c.title]))

  const paymentEvents: ActivityWithTime[] = payments.map((p) => {
    const title = campaignTitle.get(p.campaignId) ?? `Kampanye #${p.campaignId}`
    const confirmed = p.status === "CONFIRMED"
    const failed = p.status === "FAILED"
    const verb = confirmed
      ? "Donasi masuk ke"
      : failed
        ? "Donasi gagal untuk"
        : "Donasi tertunda untuk"

    return {
      id: `pay-${p.id}`,
      deskripsi: `${verb} kampanye ${title}`,
      nominal: formatWeiBnb(p.amountWei || "0"),
      satuan: "BNB",
      hash: p.transactionHash ?? "",
      hashShort: p.transactionHash ? shortenHash(p.transactionHash) : "—",
      waktu: timeAgo(p.createdAt),
      _ts: new Date(p.createdAt).getTime() || 0,
    }
  })

  const campaignEvents: ActivityWithTime[] = campaigns.map((c) => {
    const label =
      c.reviewStatus === "APPROVED"
        ? `Kampanye aktif: ${c.title}`
        : c.reviewStatus === "REJECTED"
          ? `Kampanye ditolak: ${c.title}`
          : `Kampanye baru diajukan: ${c.title}`

    return {
      id: `camp-${c.id}`,
      deskripsi: label,
      nominal: "—",
      satuan: "BNB",
      hash: c.contractTransactionHash ?? "",
      hashShort: c.contractTransactionHash
        ? shortenHash(c.contractTransactionHash)
        : "—",
      waktu: timeAgo(c.createdAt),
      _ts: new Date(c.createdAt).getTime() || 0,
    }
  })

  return [...paymentEvents, ...campaignEvents]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, limit)
    .map(({ _ts, ...item }) => {
      void _ts
      return item
    })
}
