"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, Plus } from "lucide-react"
import type { BeneficiaryCampaign } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"
import { useLanguage } from "@/components/site/language-provider"

const statusLabel: Record<string, string> = {
  PENDING_REVIEW: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  DITUTUP: "Ditutup",
  DRAFT: "Draft",
}

const statusClass: Record<string, string> = {
  PENDING_REVIEW: "bg-warm-yellow text-ink",
  APPROVED: "bg-brand-50 text-brand-700",
  REJECTED: "bg-coral/20 text-ink",
  AKTIF: "bg-brand-700 text-white",
  SELESAI: "bg-brand-50 text-brand-700",
  DITUTUP: "bg-surface-sunken text-ink-muted",
  DRAFT: "bg-surface-sunken text-ink-muted",
}

const formatBnb = (value: string) => {
  const whole = BigInt(value || "0") / BigInt("1000000000000000000")
  const fraction = (BigInt(value || "0") % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}

export function BeneficiaryCampaignGrid({
  campaigns,
}: {
  campaigns: BeneficiaryCampaign[]
}) {
  const { t } = useLanguage()
  const [filter, setFilter] = useState("ALL")
  const filtered = useMemo(
    () =>
      campaigns.filter((campaign) => {
        if (filter === "ACTIVE") return campaign.status === "AKTIF"
        if (filter === "PENDING")
          return campaign.reviewStatus === "PENDING_REVIEW"
        if (filter === "DONE") return campaign.status === "SELESAI"
        return true
      }),
    [campaigns, filter]
  )

  return (
    <div>
      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label={t("Filter kampanye")}
      >
        {[
          ["ALL", "Semua"],
          ["ACTIVE", "Aktif"],
          ["PENDING", "Menunggu Persetujuan"],
          ["DONE", "Selesai"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? "min-h-11 shrink-0 rounded-full bg-brand-700 px-4 text-sm font-medium text-white"
                : "min-h-11 shrink-0 rounded-full border border-line-ui px-4 text-sm text-ink-muted"
            }
          >
            {t(label)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mz-card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Plus size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-h3 text-ink">{t("Belum ada kampanye")}</h2>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              {t(
                "Buat kampanye pertama untuk mulai mengelola penyaluran organisasi Anda."
              )}
            </p>
          </div>
          <Link
            href="/beneficiary/campaigns/create"
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white"
          >
            {t("Buat Kampanye Baru")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: BeneficiaryCampaign }) {
  const { t } = useLanguage()
  const status =
    campaign.reviewStatus === "APPROVED" && campaign.status === "AKTIF"
      ? "APPROVED"
      : campaign.reviewStatus
  return (
    <Link
      href={`/beneficiary/campaigns/${campaign.id}`}
      className="mz-card group block p-5 transition-colors duration-150 hover:border-brand-500 focus-visible:border-brand-700 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-7 items-center rounded-full bg-brand-50 px-3 text-[0.8125rem] font-semibold tracking-[0.02em] text-brand-700 uppercase">
          {campaign.category}
        </span>
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-semibold tracking-[0.02em] uppercase ${statusClass[status] ?? statusClass.DRAFT}`}
        >
          {t(statusLabel[status] ?? status)}
        </span>
      </div>
      <h2 className="mt-5 line-clamp-2 text-h3 text-ink">{campaign.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
        {campaign.description || "Belum ada deskripsi kampanye."}
      </p>
      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <span className="text-ink-muted">{t("Dana terkumpul")}</span>
        <span className="mz-num text-right text-ink">
          {formatBnb(campaign.raisedAmountWei)}{" "}
          <span className="text-xs text-ink-muted">{campaign.currency}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-700"
          style={{ width: `${campaign.progressPct}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
        <span>
          {campaign.nextMilestone
            ? `${t("Berikutnya")}: ${campaign.nextMilestone}`
            : t("Belum ada milestone")}
        </span>
        <span className="inline-flex items-center gap-1 text-brand-700">
          {t("Lihat detail")} <ArrowUpRight size={14} strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  )
}
