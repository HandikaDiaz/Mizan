"use client"

import { useState } from "react"
import { Check, ExternalLink, Loader2, RefreshCw, X } from "lucide-react"

import type { AdminDisbursementItem } from "@/app/(dashboard)/(admin)/admin/penyaluran/actions"
import {
  approveDisbursementRequest,
  executeDisbursement,
  reconcileDisbursement,
  rejectDisbursementRequest,
  retryDisbursement,
} from "@/app/(dashboard)/(admin)/admin/penyaluran/actions"
import type { DisbursementRequestStatus } from "@/src/lib/disbursement-workflow"
import { getExplorerUrl } from "@/src/lib/chain/explorer"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/components/site/language-provider"

const statusConfig: Record<DisbursementRequestStatus, readonly [string, string]> = {
  SUBMITTED: ["Menunggu analisis", "bg-surface-sunken text-ink-muted"],
  AI_VERIFIED: ["AI terverifikasi", "bg-brand-50 text-brand-700"],
  MANUAL_REVIEW: ["Review manual", "bg-accent-200/20 text-ink"],
  REJECTED: ["Ditolak", "bg-coral/10 text-coral"],
  ADMIN_APPROVED: ["Siap dicairkan", "bg-accent-200/20 text-ink"],
  CHAIN_PENDING: ["Menunggu konfirmasi chain", "bg-accent-200/20 text-ink"],
  DISBURSED: ["Sudah disalurkan", "bg-brand-50 text-brand-700"],
  CHAIN_FAILED: ["Chain gagal", "bg-coral/10 text-coral"],
}

export function AdminDisbursementTable({ items }: { items: AdminDisbursementItem[] }) {
  const { t } = useLanguage()
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface px-6 py-12 text-center text-sm text-ink-muted">
        {t("Belum ada pengajuan pencairan.")}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {items.map((item) => <AdminDisbursementCard key={item.id} item={item} />)}
    </div>
  )
}

function AdminDisbursementCard({ item }: { item: AdminDisbursementItem }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { t } = useLanguage()
  const [label, tone] = statusConfig[item.status]
  const txHash = item.transactionHash || item.disbursementTxHash

  async function run(action: () => Promise<{ success: boolean; message: string }>) {
    setBusy(true)
    setMessage(null)
    try {
      const result = await action()
      setMessage(result.message)
      if (result.success) window.location.reload()
    } catch {
      setMessage("Terjadi kesalahan saat memproses pengajuan.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-muted">
              #{item.campaignId} · Tahap {item.milestoneOrder} · Request #{item.id}
            </span>
            <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold", tone)}>
              {t(label)}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-ink">{item.campaignTitle}</h2>
          <p className="mt-1 text-sm text-ink-muted">{item.organizerName} · {item.description}</p>
          <p className="mt-3 font-mono text-sm font-semibold text-ink">
            {formatWei(item.amountWei)} {item.currency}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.proofUrl ? <ExternalLinkButton href={item.proofUrl} label={t("Lihat bukti")} /> : null}
          {item.requestDocumentUrl ? <ExternalLinkButton href={item.requestDocumentUrl} label={t("Dokumen pencairan")} /> : null}
          {item.status === "AI_VERIFIED" || item.status === "MANUAL_REVIEW" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => approveDisbursementRequest(item.id))}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-3 text-sm font-medium text-white disabled:opacity-50"
              >
                <Check className="size-4" /> {t("Setujui")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => rejectDisbursementRequest(item.id))}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-coral/40 px-3 text-sm font-medium text-coral disabled:opacity-50"
              >
                <X className="size-4" /> {t("Tolak")}
              </button>
            </>
          ) : null}
          {item.status === "ADMIN_APPROVED" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => executeDisbursement(item.id))}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t("Cairkan on-chain")}
            </button>
          ) : null}
          {item.status === "CHAIN_PENDING" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => reconcileDisbursement(item.id))}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line-ui px-3 text-sm text-ink disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {t("Periksa receipt")}
            </button>
          ) : null}
          {item.status === "CHAIN_FAILED" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => retryDisbursement(item.id))}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {t("Retry")}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-line-soft pt-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{t("Catatan penggunaan dana")}</p>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">{item.proofNote || t("Belum ada catatan.")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{t("Output verifikasi Langflow")}</p>
          {item.langflowDecision ? <p className="mt-2 text-xs font-semibold text-brand-700">Keputusan: {item.langflowDecision}</p> : null}
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">{item.aiVerificationNote || t("Belum ada output AI.")}</p>
          {item.aiConfidence != null ? <p className="mt-2 text-xs text-ink-muted">Confidence: {Math.round(item.aiConfidence * 100)}%</p> : null}
        </div>
      </div>
      {txHash ? (
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-brand-700 hover:underline"
        >
          TX: {txHash.slice(0, 12)}…{txHash.slice(-8)} <ExternalLink className="size-3" />
        </a>
      ) : null}
      {item.chainError ? <p className="mt-3 text-sm text-coral">{item.chainError}</p> : null}
      {message ? <p className="mt-3 text-sm text-ink-muted" role="status">{t(message)}</p> : null}
    </article>
  )
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line-ui px-3 text-sm text-ink hover:bg-surface-sunken"
    >
      <ExternalLink className="size-4" /> {label}
    </a>
  )
}

function formatWei(value: string) {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}
