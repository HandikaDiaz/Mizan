import Link from "next/link"
import { Clock, ShieldAlert, ArrowLeft } from "lucide-react"

export default function BeneficiaryPendingPage() {
  return (
    <div className="mx-auto max-w-[640px] pt-12 pb-16 px-4 text-center">
      <div className="mz-card p-8 sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warm-yellow/30 text-ink">
          <Clock size={40} strokeWidth={1.5} />
        </div>

        <span className="mt-6 inline-flex h-7 items-center rounded-full bg-warm-yellow px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] text-ink">
          Menunggu Persetujuan
        </span>

        <h1 className="mt-4 text-h2 text-ink">Keanggotaan Tim Dalam Peninjauan</h1>

        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
          Permintaan Anda untuk bergabung ke organisasi sedang ditinjau oleh Admin (OWNER) lembaga kamu.
        </p>

        <div className="mt-6 rounded-lg border border-line-soft bg-brand-50 p-4 text-left text-xs text-ink-muted space-y-2">
          <div className="flex items-center gap-2 font-medium text-ink">
            <ShieldAlert size={16} className="text-brand-700" />
            Catatan Keamanan Akses:
          </div>
          <p>
            Demi keamanan dana donasi, fitur pengelolaan kampanye dan transaksi hanya dapat diakses setelah akun Anda disetujui oleh Owner lembaga.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-line-ui bg-surface px-5 text-sm font-medium text-ink hover:bg-brand-50 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  )
}
