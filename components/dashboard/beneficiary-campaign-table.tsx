"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Eye,
  Pencil,
  ListChecks,
  ImageUp,
  Banknote,
  Trash2,
  Send,
  ChevronRight,
  Inbox,
  AlertTriangle,
  X,
} from "lucide-react"
import { formatAngka } from "@/src/lib/site-data"
import type { BeneficiaryCampaign, BeneficiaryCampaignStatus } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"
import {
  deleteBeneficiaryCampaign,
  submitForReview,
} from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"

// ── Local helpers ──────────────────────────────────────────────────────────

/** Converts a wei string to a human-readable BNB string (4 decimal places max). */
function formatWeiBnb(value: string): string {
  const wei = BigInt(value || "0")
  const whole = wei / BigInt("1000000000000000000")
  const fraction = (wei % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BeneficiaryCampaignStatus,
  { bg: string; text: string; label: string }
> = {
  DRAFT: {
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    label: "Draft",
  },
  PENDING_REVIEW: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Menunggu Review Admin",
  },
  AKTIF: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  SELESAI: {
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    label: "Selesai",
  },
  DITUTUP: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Ditutup",
  },
  DITOLAK: {
    bg: "bg-coral/10",
    text: "text-coral",
    label: "Ditolak",
  },
}

const ALL_STATUSES: BeneficiaryCampaignStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "AKTIF",
  "SELESAI",
  "DITUTUP",
  "DITOLAK",
]

// ── Confirmation dialog ────────────────────────────────────────────────────

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line-soft bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onCancel}
            className="flex size-8 shrink-0 items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-[6px] border border-line-ui px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center rounded-[6px] px-4 text-sm font-medium text-white transition-colors disabled:opacity-50",
              danger ? "bg-coral hover:bg-coral/90" : "bg-brand-700 hover:bg-brand-600",
            )}
          >
            {busy ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Action menu ────────────────────────────────────────────────────────────

type ActionMenuProps = {
  campaign: BeneficiaryCampaign
  onAction: (action: string, campaign: BeneficiaryCampaign) => void
}

function ActionMenu({ campaign, onAction }: ActionMenuProps) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const isDraft = campaign.status === "DRAFT"
  const isRejected = campaign.status === "DITOLAK"

  const actions = [
    {
      key: "detail",
      label: "Lihat detail",
      icon: Eye,
      href: `/beneficiary/campaigns/${campaign.id}`,
    },
    ...(isDraft || isRejected
      ? [
          {
            key: "edit",
            label: "Edit kampanye",
            icon: Pencil,
            href: `/beneficiary/campaigns/${campaign.id}/edit`,
          } as const,
        ]
      : []),
    {
      key: "milestone",
      label: "Kelola milestone",
      icon: ListChecks,
      href: `/beneficiary/campaigns/${campaign.id}/milestones`,
    },
    {
      key: "proof",
      label: "Upload bukti",
      icon: ImageUp,
      href: `/beneficiary/campaigns/${campaign.id}/milestones`,
    },
    {
      key: "withdraw",
      label: "Ajukan pencairan",
      icon: Banknote,
      href: `/beneficiary/campaigns/${campaign.id}/disbursement`,
    },
    ...(isDraft
      ? [
          {
            key: "submit-review",
            label: "Ajukan untuk review",
            icon: Send,
            onClick: () => onAction("submit-review", campaign),
          } as const,
          {
            key: "delete",
            label: "Hapus kampanye",
            icon: Trash2,
            onClick: () => onAction("delete", campaign),
            danger: true,
          } as const,
        ]
      : []),
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={`Aksi untuk ${campaign.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <MoreVertical className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-[200px] rounded-[10px] border border-line-soft bg-surface shadow-sm"
        >
          {actions.map((action) => {
            const Icon = action.icon
            const isDanger = "danger" in action && action.danger
            if ("href" in action && action.href) {
              return (
                <Link
                  key={action.key}
                  href={action.href as string}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors first:rounded-t-[10px] last:rounded-b-[10px] hover:bg-surface-sunken"
                >
                  <Icon className="size-4 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                  {action.label}
                </Link>
              )
            }
            return (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  if ("onClick" in action && action.onClick) action.onClick()
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors first:rounded-t-[10px] last:rounded-b-[10px]",
                  isDanger
                    ? "text-coral hover:bg-coral/10"
                    : "text-ink hover:bg-surface-sunken",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isDanger ? "text-coral/70" : "text-ink-muted",
                  )}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Campaign row ───────────────────────────────────────────────────────────

type CampaignRowProps = {
  campaign: BeneficiaryCampaign
  onAction: (action: string, campaign: BeneficiaryCampaign) => void
}

function BeneficiaryCampaignRow({ campaign, onAction }: CampaignRowProps) {
  const statusCfg = STATUS_CONFIG[campaign.status]
  const raisedBnb = formatWeiBnb(campaign.raisedAmountWei)
  const targetBnb = formatWeiBnb(campaign.targetAmountWei)

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-line-soft px-6 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 lg:grid-cols-[minmax(220px,1fr)_100px_140px_80px_140px_140px_100px_auto]">
      {/* Nama kampanye + kategori */}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-[1.3] text-ink">{campaign.title}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{campaign.category}</p>
      </div>

      {/* Target dana */}
      <p className="hidden font-mono text-sm tabular-nums text-ink lg:block">
        {formatAngka(Number(targetBnb.replace(",", ".")))}
        <span className="ml-1 text-xs text-ink-muted">{campaign.currency}</span>
      </p>

      {/* Dana terkumpul */}
      <p className="hidden font-mono text-sm tabular-nums text-ink lg:block">
        {formatAngka(Number(raisedBnb.replace(",", ".")))}
        <span className="ml-1 text-xs text-ink-muted">{campaign.currency}</span>
      </p>

      {/* Donor */}
      <p className="hidden text-right font-mono text-sm tabular-nums text-ink lg:block">
        {campaign.donorCount}
      </p>

      {/* Progress */}
      <div className="hidden items-center gap-2 lg:flex">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
          <div
            className="h-full rounded-full bg-brand-700 transition-[width] duration-150"
            style={{ width: `${campaign.progressPct}%` }}
          />
        </div>
        <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted">
          {campaign.progressPct}%
        </span>
      </div>

      {/* Milestone berikutnya */}
      <p className="hidden truncate text-sm text-ink-muted lg:block">
        {campaign.nextMilestone ?? "—"}
      </p>

      {/* Status */}
      <div className="flex items-center gap-2 sm:justify-start lg:justify-start">
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-full px-3 text-[0.75rem] font-semibold tracking-[0.02em] uppercase",
            statusCfg.bg,
            statusCfg.text,
          )}
        >
          {statusCfg.label}
        </span>
        {/* Mobile: show progress inline */}
        <span className="font-mono text-xs text-ink-muted lg:hidden">
          {campaign.progressPct}%
        </span>
      </div>

      {/* Updated + actions */}
      <div className="flex items-center justify-between sm:justify-end sm:gap-3">
        <p className="text-xs text-ink-muted lg:hidden">
          {new Date(campaign.updatedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <ActionMenu campaign={campaign} onAction={onAction} />
      </div>
    </div>
  )
}

// ── Main table component ───────────────────────────────────────────────────

type BeneficiaryCampaignTableProps = {
  campaigns: BeneficiaryCampaign[]
}

type DialogState = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => Promise<void>
}

const DIALOG_CLOSED: DialogState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Konfirmasi",
  onConfirm: async () => {},
}

export function BeneficiaryCampaignTable({ campaigns }: BeneficiaryCampaignTableProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<BeneficiaryCampaignStatus | "">("")
  const [categoryFilter, setCategoryFilter] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [dialog, setDialog] = React.useState<DialogState>(DIALOG_CLOSED)
  const [toast, setToast] = React.useState<{ message: string; ok: boolean } | null>(null)

  // derived list of unique categories
  const categories = React.useMemo(
    () => [...new Set(campaigns.map((c) => c.category).filter((value): value is string => Boolean(value)))].sort(),
    [campaigns],
  )

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return campaigns.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q)) return false
      if (statusFilter && c.status !== statusFilter) return false
      if (categoryFilter && c.category !== categoryFilter) return false
      return true
    })
  }, [campaigns, search, statusFilter, categoryFilter])

  function showToast(message: string, ok: boolean) {
    setToast({ message, ok })
    setTimeout(() => setToast(null), 4000)
  }

  function openDialog(opts: Omit<DialogState, "open">) {
    setDialog({ open: true, ...opts })
  }

  function closeDialog() {
    setDialog(DIALOG_CLOSED)
  }

  async function confirmDialog() {
    setBusy(true)
    try {
      await dialog.onConfirm()
    } finally {
      setBusy(false)
      closeDialog()
      router.refresh()
    }
  }

  function handleAction(action: string, campaign: BeneficiaryCampaign) {
    if (action === "submit-review") {
      openDialog({
        title: "Ajukan untuk Review",
        description: `Kampanye "${campaign.title}" akan dikirim ke admin Mizan. Anda tidak dapat mengedit kampanye selama proses review. Lanjutkan?`,
        confirmLabel: "Ajukan Sekarang",
        onConfirm: async () => {
          const result = await submitForReview(campaign.id)
          showToast(result.message, result.success)
        },
      })
    } else if (action === "delete") {
      openDialog({
        title: "Hapus Kampanye",
        description: `Kampanye "${campaign.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
        confirmLabel: "Hapus",
        danger: true,
        onConfirm: async () => {
          const result = await deleteBeneficiaryCampaign(campaign.id)
          showToast(result.message, result.success)
        },
      })
    }
  }

  const hasFilters = search !== "" || statusFilter !== "" || categoryFilter !== ""

  return (
    <>
      {/* Toast */}
      {toast ? (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[10px] border px-5 py-3 text-sm shadow-sm",
            toast.ok
              ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
              : "border-coral/20 bg-coral/10 text-coral",
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        busy={busy}
        onConfirm={() => void confirmDialog()}
        onCancel={closeDialog}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari nama kampanye…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-line-ui bg-surface pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BeneficiaryCampaignStatus | "")}
            className="h-10 rounded-[6px] border border-line-ui bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-brand-700"
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>

          {/* Filter kategori */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-[6px] border border-line-ui bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-brand-700"
            aria-label="Filter kategori"
          >
            <option value="">Semua kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters */}
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("")
              setStatusFilter("")
              setCategoryFilter("")
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[6px] border border-line-ui px-3 text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <X className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line-soft bg-surface">
        {/* Desktop header */}
        <div className="hidden border-b border-line-soft px-6 py-3 lg:grid lg:grid-cols-[minmax(220px,1fr)_100px_140px_80px_140px_140px_100px_auto] lg:items-center lg:gap-4">
          {(
            [
              ["Kampanye / Kategori", "flex-1"],
              ["Target", "text-left"],
              ["Terkumpul", "text-left"],
              ["Donor", "text-right"],
              ["Progress", ""],
              ["Milestone berikutnya", ""],
              ["Status", ""],
              ["", ""],
            ] as [string, string][]
          ).map(([label, extra]) => (
            <span
              key={label}
              className={cn(
                "text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase",
                extra,
              )}
            >
              {label}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          campaigns.length === 0 ? (
            /* Empty state — no campaigns at all */
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <Inbox className="size-10 text-ink-muted" strokeWidth={1} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-ink">Belum ada kampanye</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Mulai dengan membuat kampanye baru untuk organisasi Anda.
                </p>
              </div>
              <Link
                href="/beneficiary/campaigns/create"
                className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                Buat Kampanye Baru
                <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            /* Empty state — filters returned nothing */
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm font-semibold text-ink">Tidak ada kampanye yang cocok</p>
              <p className="text-sm text-ink-muted">Coba ubah filter atau kata kunci pencarian.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("")
                  setCategoryFilter("")
                }}
                className="text-sm text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
              >
                Hapus semua filter
              </button>
            </div>
          )
        ) : (
          filtered.map((campaign) => (
            <BeneficiaryCampaignRow
              key={campaign.id}
              campaign={campaign}
              onAction={handleAction}
            />
          ))
        )}
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-ink-muted">
          Menampilkan {filtered.length} dari {campaigns.length} kampanye
        </p>
      )}
    </>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────

export function BeneficiaryCampaignTableSkeleton() {
  return (
    <div className="rounded-2xl border border-line-soft bg-surface">
      <div className="border-b border-line-soft px-6 py-3">
        <div className="h-3 w-40 animate-pulse rounded-full bg-surface-sunken" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line-soft px-6 py-4 last:border-b-0"
        >
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-surface-sunken" />
            <div className="h-3 w-1/4 animate-pulse rounded-full bg-surface-sunken" />
          </div>
          <div className="hidden h-3 w-24 animate-pulse rounded-full bg-surface-sunken sm:block" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-surface-sunken" />
          <div className="size-8 animate-pulse rounded-[6px] bg-surface-sunken" />
        </div>
      ))}
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────

export function BeneficiaryCampaignError({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line-soft bg-surface px-6 py-12 text-center">
      <AlertTriangle className="size-9 text-coral" strokeWidth={1} aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-ink">Gagal memuat kampanye</p>
        <p className="mt-1 text-sm text-ink-muted">
          {message ?? "Terjadi kesalahan saat mengambil data. Coba muat ulang halaman."}
        </p>
      </div>
    </div>
  )
}
