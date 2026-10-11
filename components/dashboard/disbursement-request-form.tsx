"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileCheck2, Loader2, Plus, Trash2, Upload } from "lucide-react"

import {
  buildDisbursementFormPayload,
  calculateItemSubtotalWei,
  type DisbursementItemDraft,
} from "@/src/lib/disbursement-form"
import { useLanguage } from "@/components/site/language-provider"

type Props = {
  milestoneId: number
  milestoneDescription: string
  currency: string
}

const emptyItem = (): DisbursementItemDraft => ({ name: "", quantity: "1", unit: "unit", unitPrice: "" })

export function DisbursementRequestForm({ milestoneId, milestoneDescription, currency }: Props) {
  const { t } = useLanguage()
  const router = useRouter()
  const [purpose, setPurpose] = useState("")
  const [items, setItems] = useState<DisbursementItemDraft[]>([emptyItem()])
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<"download" | "submit" | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateItem = (index: number, field: keyof DisbursementItemDraft, value: string) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const getPayload = () => buildDisbursementFormPayload({ milestoneId, purpose, items })

  const downloadTemplate = async () => {
    setBusy("download")
    setMessage(null)
    try {
      const response = await fetch("/api/beneficiary/disbursements/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        throw new Error(result.error || t("Template gagal dibuat."))
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `template-pengajuan-pencairan-${milestoneId}.docx`
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage(t("Template berhasil diunduh. Tanda tangani dokumen lalu upload kembali."))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Template gagal dibuat."))
    } finally {
      setBusy(null)
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy("submit")
    setMessage(null)
    try {
      const payload = getPayload()
      if (!file) throw new Error(t("Upload dokumen template yang sudah ditandatangani."))
      const formData = new FormData()
      formData.append("milestoneId", String(payload.milestoneId))
      formData.append("requestedAmountWei", payload.requestedAmountWei)
      formData.append("description", payload.description)
      formData.append("region", payload.region)
      formData.append("items", JSON.stringify(payload.items))
      formData.append("document", file)
      const response = await fetch("/api/beneficiary/disbursements", { method: "POST", body: formData })
      const result = (await response.json()) as { error?: string; status?: string }
      if (!response.ok) throw new Error(result.error || t("Pengajuan gagal diproses."))
      setMessage(`${t("Dokumen berhasil dikirim untuk dianalisis dengan status")} ${result.status}.`)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Pengajuan gagal diproses."))
    } finally {
      setBusy(null)
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/40 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <FileCheck2 className="mt-0.5 size-5 text-brand-700" />
        <div>
          <h3 className="font-semibold text-ink">Ajukan pencairan dana</h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">Lengkapi rincian untuk {milestoneDescription}, unduh template, tanda tangani, lalu upload dokumen untuk dianalisis.</p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-ink">
        Tujuan penggunaan dana
        <textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} disabled={busy !== null} placeholder="Contoh: Pembelian dan distribusi paket pangan untuk penerima manfaat." className="mt-1.5 w-full rounded-lg border border-line-ui bg-surface px-3 py-2 text-sm disabled:opacity-50" />
      </label>

      <div className="mt-4 rounded-xl border border-line-soft bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">Rincian penggunaan dana</p>
          <button type="button" onClick={() => setItems((current) => [...current, emptyItem()])} disabled={busy !== null} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-300 px-3 text-xs font-medium text-brand-700 disabled:opacity-50"><Plus size={15} /> Tambah item</button>
        </div>
        <div className="mt-3 space-y-4">
          {items.map((item, index) => {
            const subtotal = calculateItemSubtotalWei(item)
            return (
              <div key={index} className="rounded-lg border border-line-soft bg-surface-sunken p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-ink">Item {index + 1}</p>
                  {items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={busy !== null} className="inline-flex min-h-8 items-center gap-1 text-xs text-coral disabled:opacity-50"><Trash2 size={14} /> Hapus</button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_90px_110px_1fr]">
                  <label className="text-xs font-medium text-ink">Nama item / keperluan<input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} placeholder="Beras" disabled={busy !== null} className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm disabled:opacity-50" /></label>
                  <label className="text-xs font-medium text-ink">Jumlah<input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} disabled={busy !== null} className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm disabled:opacity-50" /></label>
                  <label className="text-xs font-medium text-ink">Satuan<input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} disabled={busy !== null} className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm disabled:opacity-50" /></label>
                  <label className="text-xs font-medium text-ink">Harga satuan ({currency})<input value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} placeholder="0.25" disabled={busy !== null} className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm disabled:opacity-50" /></label>
                </div>
                <p className="mt-2 text-right text-xs text-ink-muted">Subtotal: {subtotal ? formatBnb(subtotal) : "0"} {currency}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-ink">Template dokumen pengajuan</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">Isi seluruh rincian di atas terlebih dahulu, unduh template, tanda tangani, lalu upload kembali sebagai dokumen bukti.</p>
        <button type="button" onClick={() => void downloadTemplate()} disabled={busy !== null} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-brand-300 bg-surface px-4 text-sm font-medium text-brand-700 disabled:opacity-50">{busy === "download" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Unduh template dokumen</button>
      </div>

      <label className="mt-5 block text-sm font-medium text-ink">File dokumen bertanda tangan<input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)} disabled={busy !== null} className="mt-1.5 block min-h-12 w-full cursor-pointer rounded-[6px] border border-line-ui bg-surface px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 disabled:opacity-50" /><span className="mt-2 block text-xs text-ink-muted">Upload PDF, DOC, atau DOCX yang sudah ditandatangani. Maks 10 MB.</span></label>
      <button type="submit" disabled={busy !== null} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50">{busy === "submit" ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} {busy === "submit" ? "Mengirim untuk dianalisis…" : "Kirim untuk dianalisis"}</button>
      {message ? <p className="mt-3 text-xs text-ink-muted" role="status">{message}</p> : null}
    </form>
  )
}

function formatBnb(value: string): string {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000")).toString().padStart(18, "0").slice(0, 8).replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole.toString()
}
