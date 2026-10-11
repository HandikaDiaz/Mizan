import { cn } from "@/src/lib/utils"

/**
 * Gaya tombol Mizan. Diekspor sebagai fungsi kelas, bukan komponen, agar bisa
 * dipakai pada <a> maupun <button> tanpa masalah polimorfisme.
 *
 * Aturan (DESIGN.md §10):
 *  - Satu warna = satu makna. `accent` memakai primary purple untuk CTA.
 *  - Tinggi 40 / 48 / 56 px. Radius satu peran.
 *  - Tanpa gradient, tanpa glow.
 */

export type ButtonVariant =
  "primary" | "accent" | "outline" | "ghost" | "onDark"

export type ButtonSize = "sm" | "md" | "lg"

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-purple disabled:pointer-events-none disabled:opacity-50"

const VARIANTS: Record<ButtonVariant, string> = {
  /* Aksi utama halaman dan CTA donasi: Primary Purple. */
  primary:
    "bg-primary-purple text-white hover:bg-brand-600 active:bg-brand-800",
  accent:
    "bg-primary-purple text-white hover:bg-brand-600 active:bg-brand-800 focus-visible:outline-primary-purple",
  /* Aksi sekunder */
  outline:
    "border border-brand-200 text-brand-700 hover:bg-brand-50 active:bg-brand-100 dark:border-brand-900 dark:text-brand-300 dark:hover:bg-brand-950",
  /* Aksi tersier */
  ghost: "text-ink-body hover:bg-surface-sunken hover:text-ink",
  /* Di atas latar primary purple gelap */
  onDark:
    "border border-white/30 text-white hover:bg-white/10 active:bg-white/15 focus-visible:outline-white",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
}

export function mzBtn(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}
