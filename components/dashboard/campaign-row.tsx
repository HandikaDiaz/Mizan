import { cn } from "@/src/lib/utils"

import type { CampaignReview } from "@/src/lib/dashboard-data"
import { formatAngka } from "@/src/lib/site-data"

type CampaignRowProps = {
  campaign: CampaignReview
  className?: string
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  ACTIVE: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  COMPLETED: {
    bg: "bg-surface-sunken dark:bg-surface-sunken",
    text: "text-ink-muted",
    label: "Selesai",
  },
  CLOSED: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Ditutup",
  },
  menunggu: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Menunggu",
  },
  aktif: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  selesai: {
    bg: "bg-surface-sunken dark:bg-surface-sunken",
    text: "text-ink-muted",
    label: "Selesai",
  },
}

/**
 * Baris kampanye di tabel admin.
 *
 * DESIGN.md:
 * §5  — Nominal: mono + tabular-nums.
 * §10 — Badge status: chip dengan radius --radius-full, teks --text-label.
 * §10 — Progress bar: track --brand-100, isi --brand-700.
 * §7  — Nol bayangan, nol hover scale.
 */
export function CampaignRow({ campaign, className }: CampaignRowProps) {
  const target = campaign.target ?? 0
  const terkumpul = campaign.terkumpul ?? 0
  const pct = target > 0
    ? Math.min(100, Math.round((terkumpul / target) * 100))
    : 0
  const style = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.ACTIVE
  const title = campaign.title ?? campaign.judul
  const organizerName = campaign.organizerName ?? campaign.penyelenggara
  const currency = campaign.currency ?? campaign.satuan ?? "BNB"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line-soft py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-6",
        className,
      )}
    >
      {/* Info kampanye */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-[1.3] text-ink">
          {title}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{organizerName}</p>
      </div>

      {/* Progress bar */}
      <div className="flex w-full items-center gap-3 sm:w-40">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
          <div
            className="h-full rounded-full bg-brand-700 transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
          {pct}%
        </span>
      </div>

      {/* Nominal */}
      <p className="shrink-0 text-right font-mono text-sm tabular-nums text-ink sm:w-32">
        {formatAngka(terkumpul)}
        <span className="text-ink-muted"> / {formatAngka(target)}</span>
        <span className="ml-1 text-xs text-ink-muted">{currency}</span>
      </p>

      {/* Badge status */}
      <span
        className={cn(
          "inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[0.8125rem] font-semibold uppercase leading-[1.4] tracking-[0.02em]",
          style.bg,
          style.text,
        )}
      >
        {style.label}
      </span>
    </div>
  )
}

