"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Send, Trash2, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import type { BeneficiaryCampaignStatus } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"
import {
  submitForReview,
  deleteBeneficiaryCampaign,
} from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"

// ── Confirm dialog ─────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-confirm-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line-soft bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 id="detail-confirm-title" className="text-base font-semibold text-ink">
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
              danger
                ? "bg-coral hover:bg-coral/90"
                : "bg-brand-700 hover:bg-brand-600",
            )}
          >
            {busy ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function CampaignDetailActions({
  campaignId,
  status,
}: {
  campaignId: string
  status: BeneficiaryCampaignStatus
}) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [dialog, setDialog] = React.useState<"review" | "delete" | null>(null)
  const [toastMsg, setToastMsg] = React.useState<{ text: string; ok: boolean } | null>(null)

  function showToast(text: string, ok: boolean) {
    setToastMsg({ text, ok })
    setTimeout(() => setToastMsg(null), 4000)
  }

  async function doSubmitReview() {
    setBusy(true)
    try {
      const result = await submitForReview(campaignId)
      showToast(result.message, result.success)
      if (result.success) router.refresh()
    } finally {
      setBusy(false)
      setDialog(null)
    }
  }

  async function doDelete() {
    setBusy(true)
    try {
      const result = await deleteBeneficiaryCampaign(campaignId)
      if (result.success) {
        router.push("/beneficiary/campaigns")
      } else {
        showToast(result.message, false)
      }
    } finally {
      setBusy(false)
      setDialog(null)
    }
  }

  const isDraft = status === "DRAFT"
  const canSubmit = isDraft
  const canDelete = isDraft

  if (!canSubmit && !canDelete) return null

  return (
    <>
      {toastMsg ? (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[10px] border px-5 py-3 text-sm shadow-sm",
            toastMsg.ok
              ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
              : "border-coral/20 bg-coral/10 text-coral",
          )}
          role="status"
          aria-live="polite"
        >
          {toastMsg.text}
        </div>
      ) : null}

      <ConfirmDialog
        open={dialog === "review"}
        title="Ajukan untuk Review"
        description="Kampanye akan dikirim ke admin Mizan untuk ditinjau. Anda tidak dapat mengedit kampanye selama proses review berlangsung. Lanjutkan?"
        confirmLabel="Ajukan Sekarang"
        busy={busy}
        onConfirm={() => void doSubmitReview()}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        title="Hapus Kampanye"
        description="Kampanye ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?"
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={() => void doDelete()}
        onCancel={() => setDialog(null)}
      />

      {canSubmit && (
        <button
          type="button"
          onClick={() => setDialog("review")}
          className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <Send className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Ajukan Review
        </button>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={() => setDialog("delete")}
          className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-coral/30 px-4 text-sm font-medium text-coral transition-colors hover:bg-coral/10"
        >
          <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Hapus
        </button>
      )}
    </>
  )
}
