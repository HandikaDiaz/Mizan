import { cn } from "@/src/lib/utils"
import { ArrowUpRight } from "lucide-react"

import type { ActivityItem } from "@/src/lib/dashboard-data"
import { EXPLORER_URL } from "@/src/lib/dashboard-data"

type ActivityRowProps = {
  item: ActivityItem
  className?: string
}

/**
 * Baris aktivitas / riwayat transaksi.
 *
 * DESIGN.md:
 * §5  — Nominal: mono + tabular-nums + rata kanan.
 * §5  — Hash / alamat: mono, dipotong di tengah.
 * §10 — Tautan selalu ke BscScan testnet.
 * §4  — Pemisah: --line-soft (dekoratif).
 * §8  — Ikon lucide, strokeWidth 1.5.
 */
export function ActivityRow({ item, className }: ActivityRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0",
        className
      )}
    >
      {/* Deskripsi + hash */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-[1.55] text-ink">{item.deskripsi}</p>
        <div className="mt-1 flex items-center gap-2">
          {item.hash ? (
            <a
              href={`${EXPLORER_URL}/tx/${item.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {item.hashShort}
              <ArrowUpRight
                className="size-3"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
          ) : (
            <span className="font-mono text-xs text-ink-muted">
              {item.hashShort}
            </span>
          )}
          <span className="text-xs text-ink-muted">{item.waktu}</span>
        </div>
      </div>

      {/* Nominal */}
      {item.nominal !== "—" ? (
        <p className="shrink-0 text-right font-mono text-sm text-ink tabular-nums">
          {item.nominal} <span className="text-ink-muted">{item.satuan}</span>
        </p>
      ) : (
        <p className="shrink-0 text-right font-mono text-sm text-ink-muted">
          —
        </p>
      )}
    </div>
  )
}
