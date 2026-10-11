"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Building2, ArrowRight, Loader2, User, Phone, MapPin, Share2, Check } from "lucide-react"
import { referralSourceOptions } from "@/src/lib/onboarding/profile-schema"

export default function OnboardingRolePage() {
  const router = useRouter()

  const [selectedRole, setSelectedRole] = useState<"BENEFACTOR" | "BENEFICIARY">("BENEFACTOR")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [domicile, setDomicile] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [whatsappNotificationConsent, setWhatsappNotificationConsent] = useState(false)
  const [referralSource, setReferralSource] = useState<string>("SOCIAL_MEDIA")
  const [referralSourceOther, setReferralSourceOther] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || name.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter")
      return
    }

    if (!username.trim() || username.trim().length < 3) {
      setError("Username minimal 3 karakter")
      return
    }

    if (!/^[a-z0-9_-]+$/i.test(username.trim())) {
      setError("Username hanya boleh huruf, angka, _ dan -")
      return
    }

    if (!domicile.trim() || domicile.trim().length < 2) {
      setError("Domisili wajib diisi (misal: Jakarta Selatan)")
      return
    }

    if (whatsappNotificationConsent && !whatsappNumber.trim()) {
      setError("Masukkan nomor WhatsApp jika menyetujui notifikasi WA")
      return
    }

    if (referralSource === "OTHER" && !referralSourceOther.trim()) {
      setError("Sebutkan sumber informasi lainnya")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          domicile: domicile.trim(),
          whatsappNumber: whatsappNumber.trim() || null,
          whatsappNotificationConsent,
          referralSource,
          referralSourceOther: referralSource === "OTHER" ? referralSourceOther.trim() : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil pengguna")
      }

      if (selectedRole === "BENEFACTOR") {
        router.push("/benefactor/jelajahi")
      } else {
        router.push("/onboarding/community")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setLoading(false)
    }
  }

  return (
    <div className="mz-card p-6 sm:p-8 max-w-xl mx-auto">
      <div className="text-center">
        <p className="mz-overline">Langkah 1 dari 2</p>
        <h1 className="mt-2 text-h1 text-ink">Selamat Datang di Mizan</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pilih peran dan lengkapi data profil Anda untuk memulai.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Step 1: Pilih Peran */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
            1. Pilih Peran Anda <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opsi Donatur */}
            <button
              type="button"
              onClick={() => setSelectedRole("BENEFACTOR")}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedRole === "BENEFACTOR"
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 shadow-sm"
                : "border-line-ui bg-surface hover:border-brand-300"
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedRole === "BENEFACTOR"
                    ? "bg-brand-700 text-white"
                    : "bg-brand-100 text-brand-700"
                    }`}
                >
                  <Heart size={20} strokeWidth={1.5} />
                </div>
                {selectedRole === "BENEFACTOR" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-white">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-base font-bold text-ink">Saya ingin berdonasi</h2>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Donasi & zakat transparan berbasis blockchain.
              </p>
            </button>

            {/* Opsi Lembaga */}
            <button
              type="button"
              onClick={() => setSelectedRole("BENEFICIARY")}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedRole === "BENEFICIARY"
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 shadow-sm"
                : "border-line-ui bg-surface hover:border-brand-300"
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedRole === "BENEFICIARY"
                    ? "bg-brand-700 text-white"
                    : "bg-brand-100 text-brand-700"
                    }`}
                >
                  <Building2 size={20} strokeWidth={1.5} />
                </div>
                {selectedRole === "BENEFICIARY" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-white">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-base font-bold text-ink">Wakil Lembaga</h2>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                Buat kampanye donasi & kelola tim organisasi.
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Form Data Diri */}
        <div className="border-t border-line-soft pt-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
            2. Lengkapi Data Profil
          </p>

          {/* Nama Lengkap */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Rizky"
                className="h-11 w-full rounded-[6px] border border-line-ui bg-surface pl-10 pr-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-ink">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-muted">
                @
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="ahmad_rizky"
                className="h-11 w-full rounded-[6px] border border-line-ui bg-surface pl-8 pr-4 font-mono text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-muted">
              Huruf kecil, angka, garis bawah (_), atau strip (-). Minimal 3 karakter.
            </p>
          </div>

          {/* Domisili */}
          <div>
            <label htmlFor="domicile" className="block text-sm font-medium text-ink">
              Domisili / Kota <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                <MapPin size={18} />
              </span>
              <input
                id="domicile"
                type="text"
                required
                value={domicile}
                onChange={(e) => setDomicile(e.target.value)}
                placeholder="Contoh: Jakarta Selatan"
                className="h-11 w-full rounded-[6px] border border-line-ui bg-surface pl-10 pr-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* WhatsApp Number & Consent */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-ink">
              Nomor WhatsApp <span className="text-xs text-ink-muted">(opsional)</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                <Phone size={18} />
              </span>
              <input
                id="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="h-11 w-full rounded-[6px] border border-line-ui bg-surface pl-10 pr-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Checkbox WA Consent */}
            <label className="mt-2.5 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappNotificationConsent}
                onChange={(e) => setWhatsappNotificationConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line-ui text-brand-700 focus:ring-brand-500"
              />
              <span className="text-xs text-ink leading-relaxed">
                Saya setuju menerima notifikasi pembaruan kampanye & tanda terima via WhatsApp
              </span>
            </label>
          </div>

          {/* Referral Source */}
          <div>
            <label htmlFor="referralSource" className="block text-sm font-medium text-ink">
              Tahu Mizan dari mana? <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
                <Share2 size={18} />
              </span>
              <select
                id="referralSource"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="h-11 w-full rounded-[6px] border border-line-ui bg-surface pl-10 pr-4 text-sm text-ink focus:border-brand-500 focus:outline-none appearance-none"
              >
                {referralSourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {referralSource === "OTHER" && (
              <input
                type="text"
                required
                value={referralSourceOther}
                onChange={(e) => setReferralSourceOther(e.target.value)}
                placeholder="Sebutkan sumber informasi..."
                className="mt-2.5 h-11 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mz-btn mz-btn-primary w-full flex items-center justify-center gap-2 mt-8 py-3 text-sm font-semibold cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Menyimpan Profil...
            </>
          ) : (
            <>
              {selectedRole === "BENEFACTOR"
                ? "Selesaikan & Mulai Berdonasi"
                : "Lanjut ke Hubungkan Lembaga"}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
