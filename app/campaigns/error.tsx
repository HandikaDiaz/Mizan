"use client"

import { useEffect } from "react"
import { RotateCcw, TriangleAlert } from "lucide-react"

import { mzBtn } from "@/components/site/ui/mz-button"

/**
 * Route-level error boundary for /kampanye. Catches unexpected render/runtime
 * errors and offers a recovery action. Must be a Client Component per Next.js.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to the console for debugging in dev/observability.
    console.error("Kampanye page error:", error)
  }, [error])

  return (
    <main className="mz-section bg-surface-sunken">
      <div className="mz-container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-coral/10 text-coral">
          <TriangleAlert className="size-7" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-h2 text-ink">Terjadi kesalahan</h1>
        <p className="mt-3 max-w-md text-sm text-ink-muted">
          Halaman kampanye gagal dimuat. Ini biasanya sementara — coba muat
          ulang untuk melanjutkan.
        </p>
        <button
          type="button"
          onClick={reset}
          className={mzBtn("primary", "md", "mt-6")}
        >
          <RotateCcw className="size-4" strokeWidth={1.8} aria-hidden="true" />
          Coba lagi
        </button>
      </div>
    </main>
  )
}
