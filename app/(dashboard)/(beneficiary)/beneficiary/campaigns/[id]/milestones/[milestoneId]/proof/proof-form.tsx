"use client"

import { useActionState, useState } from "react"
import { Upload, Loader2, FileText, Download } from "lucide-react"
import { submitProof } from "./actions"

type ProofResult = { success: boolean; message: string } | null

export function ProofForm({
  milestoneId,
}: {
  milestoneId: string
}) {
  const [preview, setPreview] = useState<{ url: string; isPdf: boolean } | null>(null)
  const [proofNote, setProofNote] = useState("")
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)

  const action = async (_prev: ProofResult, formData: FormData) => {
    return submitProof(milestoneId, formData)
  }

  const [state, formAction, isPending] = useActionState(action, null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      const url = URL.createObjectURL(file)
      setPreview({ url, isPdf: !file.type.startsWith("image/") })
    } else {
      setPreview(null)
    }
  }

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true)
    setTemplateMessage(null)
    try {
      const query = new URLSearchParams({ milestoneId, proofNote })
      const response = await fetch(`/api/beneficiary/milestones/proof-template?${query.toString()}`)
      if (!response.ok) {
        const result = await response.json() as { error?: string }
        throw new Error(result.error || "Template gagal dibuat.")
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `bukti-milestone-${milestoneId}.docx`
      anchor.click()
      URL.revokeObjectURL(url)
      setTemplateMessage("Template berhasil diunduh. Tanda tangani dokumen lalu upload kembali di bawah.")
    } catch (error) {
      setTemplateMessage(error instanceof Error ? error.message : "Template gagal dibuat.")
    } finally {
      setTemplateLoading(false)
    }
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {/* Result message */}
      {state && (
        <div
          className={`rounded-[10px] border p-4 text-sm ${
            state.success
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-coral/40 bg-coral/10 text-ink"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* File input */}
      <label className="block text-sm font-medium text-ink">
        File bukti
        <div className="relative mt-2">
          <input
            name="proofFile"
            type="file"
            accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            disabled={isPending}
            onChange={handleFileChange}
            className="block min-h-12 w-full rounded-[6px] border border-line-ui bg-surface px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 disabled:opacity-50 cursor-pointer"
          />
        </div>
        <span className="mt-2 block text-xs text-ink-muted">
          Upload gambar kuitansi/dokumentasi, PDF, DOC, atau DOCX bertanda tangan. Maks 10 MB.
        </span>
      </label>

      {/* Image preview */}
      {preview && !preview.isPdf && (
        <div className="overflow-hidden rounded-[10px] border border-line-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="Preview bukti"
            className="w-full object-contain"
            style={{ maxHeight: 320 }}
          />
        </div>
      )}
      {preview?.isPdf && (
        <div className="flex items-center gap-3 rounded-[10px] border border-line-soft bg-surface-sunken p-4 text-sm text-ink-muted">
          <FileText size={20} strokeWidth={1.5} />
          PDF siap diunggah: {" "}
          <span className="font-medium text-ink">dokumen bukti penggunaan dana</span>
        </div>
      )}

      {/* Note textarea */}
      <label className="block text-sm font-medium text-ink">
        Catatan penggunaan dana
        <textarea
          name="proofNote"
          rows={4}
          disabled={isPending}
          value={proofNote}
          onChange={(event) => setProofNote(event.target.value)}
          className="mt-2 w-full rounded-[6px] border border-line-ui bg-surface px-4 py-3 text-sm disabled:opacity-50"
          placeholder="Jelaskan kapan dan kepada siapa dana disalurkan."
        />
      </label>

      <div className="rounded-[10px] border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-medium text-ink">Template dokumen bukti</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">Isi catatan penggunaan dana di atas terlebih dahulu, unduh template, tanda tangani, lalu upload kembali sebagai bukti.</p>
        <button
          type="button"
          onClick={() => void handleDownloadTemplate()}
          disabled={isPending || templateLoading}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-brand-300 bg-surface px-4 text-sm font-medium text-brand-700 disabled:opacity-50 cursor-pointer"
        >
          {templateLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Unduh template dokumen
        </button>
        {templateMessage ? <p className="mt-2 text-xs text-ink-muted" role="status">{templateMessage}</p> : null}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
            Mengunggah dan memverifikasi…
          </>
        ) : (
          <>
            <Upload size={18} strokeWidth={1.5} />
            Kirim untuk verifikasi AI
          </>
        )}
      </button>

      {isPending && (
        <p className="text-xs text-ink-muted">
          Mengunggah file ke server lalu mengirim ke AI untuk verifikasi. Proses
          ini dapat memakan waktu hingga 30 detik.
        </p>
      )}
    </form>
  )
}
