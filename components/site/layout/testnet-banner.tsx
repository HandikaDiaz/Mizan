import { CircleAlert } from "lucide-react"

import { SITE, TESTNET_NOTICE } from "@/src/lib/site-data"

/**
 * Bilah peringatan testnet.
 *
 * Ini bukan hiasan dan tidak boleh dihapus. Seluruh angka di halaman ini
 * berasal dari jaringan uji. Menyembunyikannya demi membuat demo terlihat
 * lebih meyakinkan berarti membohongi pengunjung. Lihat DESIGN.md §11.
 */
export function TestnetBanner() {
  return (
    <div className="border-b border-accent-200 bg-accent-200/35">
      <div className="mz-container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center">
        <CircleAlert
          className="size-4 shrink-0 text-accent-text"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-xs text-ink">
          <span className="font-semibold">{TESTNET_NOTICE}</span>{" "}
          <span className="mz-num text-ink-body">
            Jaringan uji · chain ID {SITE.chainId}
          </span>
        </p>
      </div>
    </div>
  )
}
