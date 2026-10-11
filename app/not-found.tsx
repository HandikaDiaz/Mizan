import { ArrowLeft, Compass } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Compass size={32} strokeWidth={1.5} />
        </div>
        <p className="mz-overline mt-8">404 · Halaman tidak ditemukan</p>
        <h1 className="mt-3 text-h1 text-ink">Halaman ini belum ada.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-muted">
          Tautan yang kamu buka mungkin sudah berubah, dipindahkan, atau tidak
          pernah tersedia.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          <ArrowLeft size={17} strokeWidth={1.5} />
          Kembali ke beranda
        </Link>
      </div>
    </main>
  )
}
