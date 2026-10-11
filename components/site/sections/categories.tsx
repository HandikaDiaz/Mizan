"use client"

import { HeartHandshake, Landmark, Scale, Siren } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SectionHead } from "@/components/site/ui/section-head"
import { useLanguage } from "@/components/site/language-provider"
import { CATEGORIES } from "@/src/lib/site-data"

const IKON: Record<string, LucideIcon> = {
  Scale,
  HeartHandshake,
  Landmark,
  Siren,
}

/**
 * Kategori penyaluran. Empat, bukan lima, dan masing-masing punya aturan
 * penyaluran yang berbeda — itu sebabnya dipisah, bukan sekadar variasi ikon.
 */

export function Categories() {
  const { t } = useLanguage()

  return (
    <section id="zakat" className="mz-section">
      <div className="mz-container">
        <SectionHead
          overline={t("Kategori penyaluran")}
          title={t("Aturan penyalurannya beda, jadi dipisah.")}
          desc={t(
            "Zakat punya ketentuan penerima yang ketat; donasi umum tidak. Mencampur keduanya dalam satu keranjang justru menyulitkan pertanggungjawaban."
          )}
        />

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((k) => {
            const Icon = IKON[k.icon] ?? Scale
            return (
              <li
                key={k.name}
                className="group bg-surface p-7 transition-colors duration-150 hover:bg-brand-50 dark:hover:bg-surface-sunken"
              >
                <Icon
                  className="size-7 text-brand-700 dark:text-brand-300"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-h3 text-ink">{t(k.name)}</h3>
                <p className="mz-num mt-1 text-xs text-ink-muted">
                  {t(k.asnaf)}
                </p>
                <p className="mt-3 text-sm text-ink-body">{t(k.desc)}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
