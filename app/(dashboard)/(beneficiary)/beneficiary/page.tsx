import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { formatWeiBnb, getLiveCampaignSnapshots } from "@/src/lib/dashboard-server"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { selectNewestCampaigns } from "@/src/lib/beneficiary/summary"

import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { db } from "@/src/prisma/db"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Dashboard Penerima",
}

export default async function PenerimaPage() {
  const { community } = await requireBeneficiaryCommunity()
  const campaigns = await getLiveCampaignSnapshots(community.id)
  const organizationCampaigns = await db.orm.public.Campaign
    .where({ communityId: community.id })
    .orderBy((campaign) => campaign.createdAt.desc())
    .all()
  const newestCampaigns = selectNewestCampaigns(organizationCampaigns)
  const totalReceivedWei = campaigns
    .reduce((total, campaign) => total + BigInt(campaign.fundedAmountWei), BigInt(0))
    .toString()
  const paymentCount = campaigns.reduce((total, campaign) => total + campaign.paymentCount, 0)

  // Milestone statistics for this community
  const communityCampaigns = await db.orm.public.Campaign
    .where({ communityId: community.id })
    .all()
  const campaignIds = communityCampaigns.map((c) => c.id)

  let allMilestones: Array<{ status: string; amountWei: string }> = []
  if (campaignIds.length > 0) {
    const milestoneRows = await Promise.all(
      campaignIds.map((cid) =>
        db.orm.public.Milestone.where({ campaignId: cid }).all(),
      ),
    )
    allMilestones = milestoneRows.flat()
  }

  const verifiedCount = allMilestones.filter(
    (m) =>
      m.status === "AI_VERIFIED" ||
      m.status === "ADMIN_APPROVED" ||
      m.status === "CHAIN_PENDING" ||
      m.status === "CHAIN_FAILED" ||
      m.status === "DISBURSED",
  ).length

  const pendingVerification = allMilestones.filter(
    (m) => m.status === "PROOF_SUBMITTED" || m.status === "MANUAL_REVIEW",
  ).length

  const disbursedWei = allMilestones
    .filter((m) => m.status === "DISBURSED")
    .reduce((sum, m) => sum + BigInt(m.amountWei || "0"), BigInt(0))
    .toString()

  const stats = [
    { label: "Total dana diterima", value: formatWeiBnb(totalReceivedWei).replace(".", ","), unit: "BNB", icon: "ArrowDownLeft" },
    { label: "Kampanye aktif", value: String(campaigns.length), unit: "kampanye", icon: "Megaphone" },
    { label: "Kontribusi masuk", value: String(paymentCount), unit: "payment", icon: "Users" },
  ] as const

  const milestoneStats = [
    { label: "Milestone terverifikasi", value: String(verifiedCount), unit: "milestone", icon: "ShieldCheck" },
    { label: "Menunggu verifikasi", value: String(pendingVerification), unit: "milestone", icon: "TrendingUp" },
    { label: "Dana dicairkan", value: formatWeiBnb(disbursedWei).replace(".", ","), unit: "BNB", icon: "Wallet" },
  ] as const

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-8">
        <p className="mz-overline"><LocalizedText text="Penerima Manfaat" /></p>
        <h1 className="mt-3 text-h1 text-ink"><LocalizedText text="Ringkasan Dana" /></h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isCurrency={stat.unit === "BNB"} />
        ))}
      </div>

      {/* Milestone statistics */}
      <section className="mt-8">
        <h2 className="text-h3 text-ink"><LocalizedText text="Penyaluran & Milestone" /></h2>
        <p className="mt-1 text-sm text-ink-muted">
          <LocalizedText text="Status verifikasi bukti penyaluran dan pencairan dana." />
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestoneStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} isCurrency={stat.unit === "BNB"} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 text-ink"><LocalizedText text="Campaign terbaru organisasi" /></h2>
        <p className="mt-1 text-sm text-ink-muted">
          <LocalizedText text="Menampilkan maksimal tiga campaign terbaru. Daftar lengkap tersedia di halaman Campaign Saya." />
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {newestCampaigns.length === 0 ? (
            <p className="rounded-2xl border border-line-soft bg-surface p-5 text-sm text-ink-muted">
              <LocalizedText text="Organisasi ini belum memiliki campaign." />
            </p>
          ) : newestCampaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold leading-[1.3] text-ink">{campaign.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{campaign.organizerName} · <LocalizedText text={formatCampaignStatus(campaign.reviewStatus)} /></p>
                </div>
                <p className="font-mono text-sm tabular-nums text-ink">
                  {formatWeiBnb(campaign.raisedAmountWei).replace(".", ",")} / {formatWeiBnb(campaign.targetAmountWei).replace(".", ",")} {campaign.currency}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
                <span className="text-xs text-ink-muted"><LocalizedText text="Dibuat" /> {formatDate(campaign.createdAt)}</span>
                <a
                  href={`/beneficiary/campaigns/${campaign.id}`}
                  className="inline-flex items-center gap-1 text-xs text-brand-700 dark:text-brand-300"
                >
                  <LocalizedText text="Lihat detail" />
                  <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatCampaignStatus(reviewStatus: string) {
  const labels: Record<string, string> = {
    AI_DRAFT: "Draft",
    PENDING_REVIEW: "Menunggu review",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  }
  return labels[reviewStatus] ?? reviewStatus
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
