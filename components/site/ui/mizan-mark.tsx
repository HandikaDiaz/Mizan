/**
 * Lambang Mizan — neraca/timbangan.
 * `mizan` berarti neraca. Lambangnya menggambarkan fungsi produknya,
 * bukan hiasan: menakar dan menyeimbangkan amanah.
 */

import { cn } from "@/src/lib/utils"
import Image from "next/image"

export function MizanMark({ className }: { className?: string }) {
  return (
    <Image
      src="/Favicon.png"
      alt=""
      width={24}
      height={24}
      className={cn("object-contain", className)}
    />
  )
}

/** Kunci wordmark: lambang + nama. Satu-satunya penempatan lambang di halaman. */
export function MizanWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MizanMark className="size-[1.45em] text-brand-700 dark:text-brand-400" />
      <span className="text-[1.15em] font-extrabold tracking-[-0.03em] text-ink">
        Mizan
      </span>
    </span>
  )
}

/** Placeholder intro logo: dua lapisan memudahkan penggantian asset image 1/2 nanti. */
export function MizanIntroLogo({ solid = false }: { solid?: boolean }) {
  return (
    <Image
      src="/Primary-Logo.png"
      alt="Mizan"
      width={1200}
      height={400}
      className={cn("bg-transparent object-contain", solid && "opacity-90")}
    />
  )
}
