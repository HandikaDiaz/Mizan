"use client"

import { useMemo, useRef, useState } from "react"
import { useActionState } from "react"
import Image from "next/image"
import { ImageUp, Loader2, Plus, Trash2, X } from "lucide-react"

import type { BeneficiaryCampaignFormState } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"
import { uploadCampaignImage } from "@/src/lib/uploads/campaign-image"
import { cn } from "@/src/lib/utils"

type FormAction = (
  state: BeneficiaryCampaignFormState,
  formData: FormData,
) => Promise<BeneficiaryCampaignFormState>

type MilestoneDraft = { description: string; amount: string }

const initialState: BeneficiaryCampaignFormState = { success: false, message: "" }
const categories = [
  ["ZAKAT", "Zakat"],
  ["DONASI_UMUM", "Donasi Umum"],
  ["WAKAF", "Wakaf"],
  ["BENCANA", "Tanggap Bencana"],
] as const

const toWei = (value: string) => {
  const [whole, fraction = ""] = value.replace(",", ".").split(".")
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > 18) return "0"
  return (
    BigInt(whole) * BigInt("1000000000000000000") +
    BigInt(fraction.padEnd(18, "0") || "0")
  ).toString()
}

export function BeneficiaryCampaignCreateForm({
  action,
  organizerName,
}: {
  action: FormAction
  organizerName: string
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([{ description: "", amount: "" }])
  const [target, setTarget] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const targetWei = useMemo(() => BigInt(toWei(target)), [target])
  const milestoneTotal = useMemo(
    () => milestones.reduce((total, milestone) => total + BigInt(toWei(milestone.amount)), BigInt(0)),
    [milestones],
  )
  const milestoneTotalMismatch = targetWei > BigInt(0) && milestoneTotal !== targetWei

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const result = await uploadCampaignImage(file)
      if (result.ok) setImageUrl(result.url)
      else setUploadError(result.error)
    } catch {
      setUploadError("Gagal mengunggah gambar.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <form action={formAction} className="space-y-6 pb-24 sm:pb-0">
      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div>
          <p className="mz-overline">Bagian 01</p>
          <h2 className="mt-2 text-h2 text-ink">Informasi dasar</h2>
          <p className="mt-2 text-sm text-ink-muted">Lengkapi informasi yang akan dilihat oleh calon donatur.</p>
        </div>
        <Field id="title" label="Judul kampanye" placeholder="Contoh: Air Bersih untuk Warga Pesisir" error={state.errors?.title} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField id="category" label="Tipe kampanye" options={categories} error={state.errors?.category} />
          <Field id="location" label="Lokasi" required={false} placeholder="Contoh: Lombok Timur, NTB" error={state.errors?.location} />
        </div>
        <Field id="organizerName" label="Penyelenggara" defaultValue={organizerName} readOnly error={state.errors?.organizerName} />
        <TextareaField id="description" label="Deskripsi kampanye" placeholder="Ceritakan kebutuhan, penerima manfaat, dan rencana penggunaan dana." error={state.errors?.description} />
      </section>

      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div>
          <p className="mz-overline">Bagian 02</p>
          <h2 className="mt-2 text-h2 text-ink">Target dana</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-ink">Target dana (BNB)</label>
            <div className="flex items-center rounded-[6px] border border-line-ui bg-surface focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
              <input name="targetAmountWei" type="hidden" value={toWei(target)} />
              <input id="target" name="target" required inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} className="h-12 min-w-0 flex-1 border-0 bg-transparent px-4 font-mono outline-none" placeholder="0,00" />
              <span className="px-4 font-mono text-sm text-ink-muted">BNB</span>
            </div>
            {state.errors?.target ? <p className="mt-1 text-xs text-brand-500">{state.errors.target}</p> : null}
          </div>
          <Field id="daysLeft" label="Sisa hari kampanye" type="number" min="1" max="3650" placeholder="Contoh: 30" error={state.errors?.daysLeft} inputClassName="font-mono tabular-nums" />
        </div>
        <p className="rounded-xl border border-line-soft bg-surface-sunken px-4 py-3 text-sm text-ink-muted">Dana akan disalurkan ke wallet komunitas yang terdaftar. Wallet tidak perlu diisi ulang.</p>
      </section>

      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div>
          <p className="mz-overline">Bagian 03</p>
          <h2 className="mt-2 text-h2 text-ink">Gambar sampul</h2>
        </div>
        <input type="hidden" name="image" value={imageUrl} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-[10px] border border-line-soft bg-surface-sunken sm:w-44">
            {imageUrl ? <><Image src={imageUrl} alt="Pratinjau sampul kampanye" fill sizes="176px" className="object-cover" /><button type="button" onClick={() => setImageUrl("")} className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-ink/70 text-white" aria-label="Hapus gambar"><X className="size-3.5" /></button></> : <div className="flex h-full flex-col items-center justify-center gap-1 text-ink-muted"><ImageUp className="size-5" /><span className="text-[0.6875rem]">Belum ada gambar</span></div>}
          </div>
          <div className="flex-1 space-y-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-brand-200 px-4 text-sm font-medium text-brand-700 disabled:opacity-50">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
              {uploading ? "Mengunggah…" : "Unggah gambar"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImage} className="hidden" />
            <p className="text-xs text-ink-muted">PNG, JPG, WEBP, atau GIF hingga 5 MB.</p>
            {uploadError || state.errors?.image ? <p className="text-xs text-brand-500">{uploadError ?? state.errors?.image}</p> : null}
          </div>
        </div>
      </section>

      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="mz-overline">Bagian 04</p><h2 className="mt-2 text-h2 text-ink">Milestone penyaluran</h2></div><span className="mz-num text-sm text-ink-muted">{milestones.length} tahap</span></div>
        <div className="space-y-4">
          {milestones.map((milestone, index) => <div key={index} className="rounded-[10px] border border-line-soft bg-very-light-purple p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-ink">Tahap {index + 1}</span>{milestones.length > 1 ? <button type="button" onClick={() => setMilestones((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] text-coral" aria-label={`Hapus tahap ${index + 1}`}><Trash2 size={18} /></button> : null}</div>
            <input value={milestone.description} onChange={(event) => setMilestones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} className="h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4" placeholder="Deskripsi tahap penyaluran" />
            <div className="mt-3 flex items-center rounded-[6px] border border-line-ui bg-surface"><input value={milestone.amount} onChange={(event) => setMilestones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))} className="h-12 min-w-0 flex-1 bg-transparent px-4 font-mono outline-none" placeholder="Nominal" inputMode="decimal" /><span className="px-4 font-mono text-sm text-ink-muted">BNB</span></div>
            <input type="hidden" name="milestones" value={JSON.stringify({ description: milestone.description, amountWei: toWei(milestone.amount) })} readOnly />
          </div>)}
        </div>
        <button type="button" onClick={() => setMilestones((current) => [...current, { description: "", amount: "" }])} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-brand-200 px-4 text-sm font-medium text-brand-700"><Plus size={18} />Tambah milestone</button>
        <div className={milestoneTotalMismatch ? "rounded-[10px] border border-coral/40 bg-coral/10 p-4 text-sm text-coral" : "rounded-[10px] border border-line-soft bg-very-light-purple p-4 text-sm text-ink-muted"} role="status">Total milestone: <span className="mz-num font-semibold">{(Number(milestoneTotal) / 1e18).toLocaleString("id-ID", { maximumFractionDigits: 4 })} BNB</span>{milestoneTotalMismatch ? " — harus sama dengan target dana." : ""}</div>
      </section>

      {state.message ? <p className="rounded-[10px] border border-coral/40 bg-coral/10 p-4 text-sm text-coral" role="alert">{state.message}</p> : null}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-surface/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0"><button type="submit" disabled={pending || uploading || milestoneTotalMismatch} className="flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-700 px-6 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{pending ? "Mengajukan…" : "Ajukan Kampanye"}</button></div>
      <p className="text-xs text-ink-muted">Data testnet — dana tidak nyata. Kampanye akan ditinjau Admin sebelum tampil ke publik.</p>
    </form>
  )
}

function Field({ id, label, defaultValue = "", placeholder, error, type = "text", min, max, required = true, readOnly = false, inputClassName }: { id: string; label: string; defaultValue?: string | number; placeholder?: string; error?: string; type?: string; min?: string; max?: string; required?: boolean; readOnly?: boolean; inputClassName?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label><input id={id} name={id} type={type} min={min} max={max} required={required} readOnly={readOnly} defaultValue={defaultValue} placeholder={placeholder} className={cn("h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100", readOnly && "bg-surface-sunken text-ink-muted", inputClassName, error && "border-brand-500")} />{!required ? <span className="mt-1 block text-xs text-ink-muted">Opsional</span> : null}{error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}</div>
}

function SelectField({ id, label, options, error }: { id: string; label: string; options: readonly (readonly [string, string])[]; error?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label><select id={id} name={id} required defaultValue="" className={cn("h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100", error && "border-brand-500")}><option value="" disabled>Pilih kategori</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>{error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}</div>
}

function TextareaField({ id, label, placeholder, error }: { id: string; label: string; placeholder: string; error?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label><textarea id={id} name={id} required rows={5} placeholder={placeholder} className={cn("w-full resize-y rounded-[6px] border border-line-ui bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100", error && "border-brand-500")} />{error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}</div>
}
