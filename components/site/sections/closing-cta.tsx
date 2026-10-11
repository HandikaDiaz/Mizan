import { ArrowRight, FileCheck } from "lucide-react"

import { mzBtn } from "@/components/site/ui/mz-button"

/**
 * Ajakan penutup. Latar brand-800 (bukan gradient), teks putih.
 */

export function ClosingCta() {
  return (
    <section className="bg-brand-800">
      <div className="mz-container py-16 sm:py-20">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[38rem]">
            <p className="mz-overline text-brand-200">
              Mulai dari satu donasi
            </p>
            <h2 className="mt-4 text-h1 text-balance text-white">
              Kamu tidak perlu percaya pada kami. Cukup periksa sendiri.
            </h2>
            <p className="mt-5 mz-prose text-brand-100">
              Hubungkan dompet, pilih kampanye, lalu ikuti jejaknya di explorer
              sampai dananya sampai ke penerima.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="#kampanye" className={mzBtn("accent", "lg")}>
              Donasi Sekarang
              <ArrowRight
                className="size-5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
            <a href="#cara-kerja" className={mzBtn("onDark", "lg")}>
              <FileCheck
                className="size-5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Pelajari Dulu
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
