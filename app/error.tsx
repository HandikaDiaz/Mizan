"use client"

import { RefreshCw, WifiOff } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    console.error(error)

    const updateConnectionStatus = () => setIsOffline(!navigator.onLine)
    updateConnectionStatus()
    window.addEventListener("online", updateConnectionStatus)
    window.addEventListener("offline", updateConnectionStatus)

    return () => {
      window.removeEventListener("online", updateConnectionStatus)
      window.removeEventListener("offline", updateConnectionStatus)
    }
  }, [error])

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-200/25 text-accent-text">
          <WifiOff size={30} strokeWidth={1.5} />
        </div>
        <p className="mz-overline mt-8">
          {isOffline ? "Koneksi terputus" : "Terjadi gangguan"}
        </p>
        <h1 className="mt-3 text-h1 text-ink">
          {isOffline ? "Kamu sedang offline." : "Halaman belum bisa dimuat."}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-muted">
          {isOffline
            ? "Periksa koneksi internetmu, lalu coba lagi ketika sudah tersambung."
            : "Ada kendala sementara saat memuat halaman. Coba muat ulang atau kembali ke beranda."}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={unstable_retry}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            <RefreshCw size={17} strokeWidth={1.5} />
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-[10px] border border-line-ui px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
