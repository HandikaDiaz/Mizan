"use client"

import { cn } from "@/src/lib/utils"
import type { StatItem } from "@/src/lib/dashboard-data"
import {
  Wallet,
  ArrowUpRight,
  Megaphone,
  Users,
  Heart,
  TrendingUp,
  ArrowDownLeft,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLanguage } from "@/components/site/language-provider"

/**
 * Peta nama ikon ke komponen lucide-react.
 * Dipakai karena mock data menyimpan nama ikon sebagai string.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  ArrowUpRight,
  Megaphone,
  Users,
  Heart,
  TrendingUp,
  ArrowDownLeft,
  ShieldCheck,
}

type StatCardProps = {
  stat: StatItem
  /** Apakah nilai nominal uang — kalau ya, pakai mono + tabular + rata kanan */
  isCurrency?: boolean
  className?: string
}

/**
 * Kartu statistik dashboard.
 *
 * DESIGN.md §7 & §10:
 * - Latar --surface, batas --line-soft, radius --radius-lg (16px).
 * - Kartu diam: tanpa bayangan, cukup batas.
 * - Nol hover scale, nol glow.
 *
 * §5: Nominal uang selalu mono + tabular-nums.
 * §8: lucide-react, strokeWidth 1.5, 24px mandiri.
 */
export function StatCard({
  stat,
  isCurrency = false,
  className,
}: StatCardProps) {
  const Icon = ICON_MAP[stat.icon]
  const { t } = useLanguage()

  return (
    <div
      className={cn(
        "rounded-2xl border border-line-soft bg-surface p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-[1.55] text-ink-muted">
            {t(stat.label)}
          </p>
          <p
            className={cn(
              "mt-2 text-h2 text-ink",
              isCurrency && "font-mono tabular-nums"
            )}
          >
            {stat.value}
            <span className="ml-1.5 text-sm font-normal text-ink-muted">
              {t(stat.unit)}
            </span>
          </p>
        </div>
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-950">
            <Icon
              className="size-5 text-brand-700 dark:text-brand-300"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
