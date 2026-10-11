"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"

type CommunityProfileModalProps = {
  community: {
    id: number
    name: string
    walletAddress: string
    registrationNumber?: string | null
    description?: string | null
    logoUrl?: string | null
    websiteUrl?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    address?: string | null
    legalDocumentUrl?: string | null
  }
  onClose: () => void
}

export function CommunityProfileModal({ community, onClose }: CommunityProfileModalProps) {
  const [open, setOpen] = useState(true)
  const [form, setForm] = useState({
    name: community.name,
    walletAddress: community.walletAddress,
    description: community.description ?? "",
    logoUrl: community.logoUrl ?? "",
    websiteUrl: community.websiteUrl ?? "",
    contactEmail: community.contactEmail ?? "",
    contactPhone: community.contactPhone ?? "",
    address: community.address ?? "",
    registrationNumber: community.registrationNumber ?? "",
    legalDocumentUrl: community.legalDocumentUrl ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const close = () => {
    setOpen(false)
    onClose()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/communities/${community.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "Profil gagal disimpan.")
      close()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profil gagal disimpan.")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="community-profile-title">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="mz-overline">Profil organisasi</p><h2 id="community-profile-title" className="mt-2 text-h2 text-ink">Lengkapi informasi organisasi</h2><p className="mt-2 text-sm text-ink-muted">Profil ini akan membantu donatur mengenal dan menilai organisasi Anda.</p></div>
          <button type="button" onClick={close} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken" aria-label="Tutup"><X className="size-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Nama organisasi" value={form.name} onChange={(value) => update("name", value)} required />
          <Textarea label="Deskripsi organisasi" value={form.description} onChange={(value) => update("description", value)} placeholder="Ceritakan misi dan kegiatan organisasi." />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Website" value={form.websiteUrl} onChange={(value) => update("websiteUrl", value)} placeholder="https://..." /><Input label="URL logo" value={form.logoUrl} onChange={(value) => update("logoUrl", value)} placeholder="https://..." /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Email kontak" type="email" value={form.contactEmail} onChange={(value) => update("contactEmail", value)} /><Input label="Nomor kontak" value={form.contactPhone} onChange={(value) => update("contactPhone", value)} /></div>
          <Textarea label="Alamat" value={form.address} onChange={(value) => update("address", value)} />
          <Input label="Wallet organisasi" value={form.walletAddress} onChange={(value) => update("walletAddress", value)} mono required />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Nomor registrasi / NPWP" value={form.registrationNumber} onChange={(value) => update("registrationNumber", value)} /><Input label="URL dokumen legalitas" value={form.legalDocumentUrl} onChange={(value) => update("legalDocumentUrl", value)} /></div>
          {error ? <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end"><button type="button" onClick={close} className="h-11 rounded-[10px] border border-line-ui px-5 text-sm font-medium text-ink">Lengkapi nanti</button><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : null}{saving ? "Menyimpan…" : "Simpan profil"}</button></div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = "text", mono = false, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; mono?: boolean; required?: boolean }) {
  return <label className="block text-sm font-medium text-ink">{label}{required ? <span className="ml-1 text-coral">*</span> : null}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-1.5 h-11 w-full rounded-[6px] border border-line-ui bg-surface px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100 ${mono ? "font-mono text-xs" : ""}`} /></label>
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block text-sm font-medium text-ink">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="mt-1.5 w-full rounded-[6px] border border-line-ui bg-surface px-3 py-2 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100" /></label>
}
