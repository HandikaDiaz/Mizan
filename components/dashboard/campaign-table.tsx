"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { Check, Pencil, Trash2, X } from "lucide-react"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import { formatAngka } from "@/src/lib/site-data"
import { useLanguage } from "@/components/site/language-provider"
import {
  filterAdminCampaigns,
  type AdminCampaignSource,
} from "@/src/lib/admin-campaign-filter"
import {
  approveCampaign,
  deleteCampaign,
  rejectCampaign,
} from "@/app/(dashboard)/(admin)/admin/campaigns/actions"

type CampaignTableProps = { campaigns: CampaignReview[] }

const STATUS_STYLES: Record<
  NonNullable<CampaignReview["reviewStatus"]>,
  { bg: string; text: string; label: string }
> = {
  AI_DRAFT: {
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    label: "AI draft",
  },
  PENDING_REVIEW: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Review",
  },
  APPROVED: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-coral/10",
    text: "text-coral",
    label: "Rejected",
  },
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const { t } = useLanguage()
  const [query, setQuery] = React.useState("")
  const [source, setSource] = React.useState<AdminCampaignSource>("ALL")
  const filteredCampaigns = filterAdminCampaigns(campaigns, { query, source })

  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">{t("Belum ada kampanye.")}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line-soft bg-surface">
      <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Cari judul, penyelenggara, atau sumber AI…")}
          className="h-11 min-w-0 flex-1 rounded-lg border border-line-ui bg-surface px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={source}
          onChange={(event) =>
            setSource(event.target.value as AdminCampaignSource)
          }
          aria-label={t("Filter sumber kampanye")}
          className="h-11 rounded-lg border border-line-ui bg-surface px-3 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        >
          <option value="ALL">{t("Semua sumber")}</option>
          <option value="AI_MOCK">{t("AI Mizan")}</option>
          <option value="MANUAL">{t("Manual")}</option>
        </select>
      </div>
      {filteredCampaigns.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-ink-muted">
          {t("Tidak ada campaign yang sesuai filter.")}
        </p>
      ) : null}
      <div className="hidden border-b border-line-soft px-6 py-3 sm:flex">
        <span className="min-w-0 flex-1 text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
          {t("Kampanye / AI source")}
        </span>
        <span className="w-32 text-right text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
          {t("Target")}
        </span>
        <span className="w-32 text-center text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
          {t("Review")}
        </span>
        <span className="w-40 text-center text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
          {t("Aksi")}
        </span>
      </div>
      {filteredCampaigns.map((campaign) => (
        <CampaignTableRow key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}

function CampaignTableRow({ campaign }: { campaign: CampaignReview }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const reviewStatus = campaign.reviewStatus ?? "AI_DRAFT"
  const style = STATUS_STYLES[reviewStatus]
  const title = campaign.title ?? campaign.judul
  const organizerName =
    campaign.source === "AI_MOCK"
      ? t("Admin Mizan")
      : (campaign.organizerName ?? campaign.penyelenggara)

  async function run(action: (id: string) => Promise<unknown>) {
    setBusy(true)
    setFeedback(null)
    try {
      const result = await action(campaign.id)
      if (
        result &&
        typeof result === "object" &&
        "message" in result &&
        typeof result.message === "string"
      ) {
        setFeedback(result.message)
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-line-soft px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-[1.3] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs text-ink-muted">{organizerName}</p>
        <span
          className={cn(
            "mt-2 inline-flex rounded-full px-2 py-1 text-[0.6875rem] font-semibold",
            campaign.source === "AI_MOCK"
              ? "bg-soft-lavender text-primary-purple"
              : "bg-surface-sunken text-ink-muted"
          )}
        >
          {campaign.source === "AI_MOCK" ? t("AI Mizan") : t("Manual")}
        </span>
        <p className="mt-2 text-xs text-ink-muted">
          {t("Confidence AI")}{" "}
          {campaign.aiConfidence == null
            ? "—"
            : `${Math.round(campaign.aiConfidence * 100)}%`}
          {campaign.aiReference ? ` · ${campaign.aiReference}` : ""}
        </p>
        {campaign.recipientWallet ? (
          <p className="mt-1 truncate font-mono text-[11px] text-ink-muted">
            {t("Recipient")}: {campaign.recipientWallet}
          </p>
        ) : null}
      </div>

      <p className="shrink-0 text-right font-mono text-sm text-ink tabular-nums sm:w-32">
        {formatAngka(campaign.target ?? 0)}{" "}
        <span className="text-xs text-ink-muted">
          {campaign.currency ?? campaign.satuan ?? "BNB"}
        </span>
      </p>

      <div className="sm:w-32 sm:text-center">
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-full px-3 text-[0.75rem] font-semibold tracking-[0.02em] uppercase",
            style.bg,
            style.text
          )}
        >
          {style.label}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:w-40 sm:justify-center">
        {campaign.source === "AI_MOCK" &&
        (reviewStatus === "AI_DRAFT" || reviewStatus === "PENDING_REVIEW") ? (
          <button
            type="button"
            title={t("Approve campaign AI")}
            aria-label={t("Approve campaign AI")}
            disabled={busy}
            onClick={() => void run(approveCampaign)}
            className="flex size-8 items-center justify-center rounded-[6px] text-brand-700 hover:bg-brand-50 disabled:opacity-50 dark:text-brand-300 dark:hover:bg-brand-950"
          >
            <Check className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        {campaign.source !== "AI_MOCK" && reviewStatus === "PENDING_REVIEW" ? (
          <>
            <button
              type="button"
              title={t("Approve")}
              disabled={busy}
              onClick={() => void run(approveCampaign)}
              className="flex size-8 items-center justify-center rounded-[6px] text-brand-700 hover:bg-brand-50 disabled:opacity-50 dark:text-brand-300 dark:hover:bg-brand-950"
            >
              <Check className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              title={t("Reject")}
              disabled={busy}
              onClick={() => void run(rejectCampaign)}
              className="flex size-8 items-center justify-center rounded-[6px] text-coral hover:bg-coral/10 disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <Link
          href={`/admin/campaigns/${campaign.id}/edit`}
          className="flex size-8 items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          aria-label={`Edit kampanye ${title}`}
        >
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <button
          type="button"
          title={t("Hapus")}
          disabled={busy}
          onClick={() => void run(deleteCampaign)}
          className="flex size-8 items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500 disabled:opacity-50 dark:hover:bg-brand-950"
        >
          <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
