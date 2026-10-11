"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallets } from "@privy-io/react-auth"
import { KeyRound, Building2, Copy, Check, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { CommunityProfileModal } from "@/components/community/community-profile-modal"

export default function OnboardingCommunityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"INVITE" | "REGISTER">("INVITE")

  // Form State Opsi A (Invite Code)
  const [inviteCode, setInviteCode] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [joinResult, setJoinResult] = useState<{ communityName: string } | null>(null)

  // Form State Opsi B (Register Community)
  const [name, setName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [legalDocumentUrl, setLegalDocumentUrl] = useState("")
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [createdCommunity, setCreatedCommunity] = useState<{
    id: number
    name: string
    inviteCode: string
    walletAddress: string
  } | null>(null)

  const [copied, setCopied] = useState(false)
  const { wallets } = useWallets()
  const ownerWalletAddress = useMemo(
    () => wallets.find((wallet) => wallet.type === "ethereum")?.address ?? "",
    [wallets],
  )

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle Opsi A Submit
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError(null)

    if (!inviteCode.trim()) {
      setInviteError("Silakan masukkan kode undangan")
      return
    }

    setInviteLoading(true)

    try {
      const res = await fetch("/api/onboarding/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal bergabung ke komunitas")
      }

      setJoinResult({ communityName: data.community.name })
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setInviteLoading(false)
    }
  }

  // Handle Opsi B Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)

    if (!name.trim()) {
      setRegisterError("Nama lembaga/komunitas wajib diisi")
      return
    }

    const evmRegex = /^0x[a-fA-F0-9]{40}$/
    const effectiveWalletAddress = walletAddress.trim() || ownerWalletAddress
    if (!evmRegex.test(effectiveWalletAddress)) {
      setRegisterError("Format alamat dompet EVM tidak valid. Harus diawali '0x' disusul 40 karakter hex.")
      return
    }

    setRegisterLoading(true)

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          walletAddress: effectiveWalletAddress,
          registrationNumber: registrationNumber.trim() || undefined,
          legalDocumentUrl: legalDocumentUrl.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan lembaga")
      }

      setCreatedCommunity({
        id: data.id,
        name: data.name,
        inviteCode: data.inviteCode,
        walletAddress: data.walletAddress || effectiveWalletAddress,
      })
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setRegisterLoading(false)
    }
  }

  // Jika Opsi A Sukses: Tampilkan Konfirmasi Join
  if (joinResult) {
    return (
      <div className="mz-card p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="mt-4 text-h2 text-ink">Permintaan Terkirim</h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
          Permintaan bergabung ke <strong className="text-ink">{joinResult.communityName}</strong> terkirim. Menunggu persetujuan dari admin lembaga.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mz-btn mz-btn-primary w-full sm:w-auto min-w-[200px] cursor-pointer"
          >
            Lanjut ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Jika Opsi B Sukses: Tampilkan Konfirmasi Registrasi dengan Kode Undangan Menonjol
  if (createdCommunity) {
    return (
      <div className="mz-card p-6 sm:p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="mt-4 text-h2 text-ink">Lembaga Berhasil Didaftarkan!</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Organisasi <strong className="text-ink">{createdCommunity.name}</strong> siap menerima bantuan & mengelola kampanye.
        </p>

        {/* Highlight Kode Undangan */}
        <div className="mt-6 rounded-2xl border-2 border-brand-500 bg-brand-50 p-6 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Kode Undangan Tim Anda
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-extrabold tracking-widest text-brand-900">
              {createdCommunity.inviteCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(createdCommunity.inviteCode)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-brand-700 border border-brand-200 shadow-xs hover:bg-brand-100 transition-colors"
              title="Salin Kode Undangan"
            >
              {copied ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-emerald-600 font-medium">Kode tersalin ke clipboard!</p>}
          <p className="mt-3 text-xs text-ink-muted leading-relaxed">
            Bagikan kode ini ke rekan tim supaya mereka bisa gabung ke <strong>{createdCommunity.name}</strong> di Mizan.
          </p>
        </div>

        <CommunityProfileModal
          community={createdCommunity}
          onClose={() => router.refresh()}
        />

        <div className="mt-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mz-btn mz-btn-primary w-full sm:w-auto min-w-[200px] cursor-pointer"
          >
            Lanjut ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mz-card p-6 sm:p-8">
      <button
        type="button"
        onClick={() => router.push("/onboarding/role")}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Pilihan Peran
      </button>

      <div className="text-center">
        <p className="mz-overline">Langkah 2 dari 2</p>
        <h1 className="mt-2 text-h1 text-ink">Hubungkan ke Lembaga</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Gabung dengan kode undangan atau daftarkan organisasi baru.
        </p>
      </div>

      {/* Tabs / Toggle pilihan */}
      <div className="mt-6 flex rounded-lg border border-line-ui bg-brand-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("INVITE")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === "INVITE"
            ? "bg-surface text-brand-700 shadow-xs"
            : "text-ink-muted hover:text-ink"
            }`}
        >
          <KeyRound size={16} />
          Sudah punya kode
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("REGISTER")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "REGISTER"
            ? "bg-surface text-brand-700 shadow-xs"
            : "text-ink-muted hover:text-ink"
            }`}
        >
          <Building2 size={16} />
          Daftarkan lembaga baru
        </button>
      </div>

      {/* Opsi A — Input Kode Undangan */}
      {activeTab === "INVITE" && (
        <form onSubmit={handleJoinSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-ink">
              Kode Undangan Komunitas
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ABC234X"
              maxLength={7}
              className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 font-mono text-lg uppercase tracking-wider text-ink focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Minta kode 7-karakter dari admin lembaga/organisasi Anda.
            </p>
          </div>

          {inviteError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {inviteError}
            </div>
          )}

          <button
            type="submit"
            disabled={inviteLoading}
            className="mz-btn mz-btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            {inviteLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memeriksa Kode...
              </>
            ) : (
              "Gabung ke Lembaga"
            )}
          </button>
        </form>
      )}

      {/* Opsi B — Form Pendaftaran Lembaga Baru */}
      {activeTab === "REGISTER" && (
        <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="communityName" className="block text-sm font-medium text-ink">
              Nama Lembaga / Komunitas <span className="text-red-500">*</span>
            </label>
            <input
              id="communityName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Yayasan Peduli Kasih"
              className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-ink">
              Alamat Dompet Treasury (EVM) <span className="text-red-500">*</span>
            </label>
            <input
              id="walletAddress"
              type="text"
              required
              value={walletAddress || ownerWalletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 font-mono text-sm text-ink focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
              Default diisi dari wallet owner. Kamu tetap bisa menggantinya dengan wallet treasury organisasi atau wallet multisig (Safe).
            </p>
          </div>

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-ink">
              Nomor Registrasi / NPWP <span className="text-xs text-ink-muted">(opsional)</span>
            </label>
            <input
              id="registrationNumber"
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Contoh: 01.234.567.8-901.000"
              className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="legalDocumentUrl" className="block text-sm font-medium text-ink">
              Tautan Dokumen Legalitas <span className="text-xs text-ink-muted">(opsional)</span>
            </label>
            <input
              id="legalDocumentUrl"
              type="text"
              value={legalDocumentUrl}
              onChange={(e) => setLegalDocumentUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Dapat dilengkapi kemudian lewat halaman Profil Organisasi.
            </p>
          </div>

          {registerError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {registerError}
            </div>
          )}

          <button
            type="submit"
            disabled={registerLoading}
            className="mz-btn mz-btn-primary w-full flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {registerLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Daftarkan Lembaga...
              </>
            ) : (
              "Daftarkan Lembaga Baru"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
