"use client"

import { ExternalLink, Quote } from "lucide-react"

import { useLanguage } from "@/components/site/language-provider"
import { STORY, SITE } from "@/src/lib/site-data"

/**
 * Kisah penerima — satu cerita besar, bukan carousel.
 *
 * Tanpa foto. Memajang potret orang sebagai "penerima manfaat" padahal bukan
 * adalah bentuk kebohongan yang paling umum di halaman donasi. Ceritanya
 * dibawa oleh kutipan dan bukti angkanya, bukan oleh gambar.
 */

export function Story() {
  const { t } = useLanguage()

  return (
    <section className="mz-section" aria-labelledby="mz-kisah">
      <div className="mz-container grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="mz-overline">{t("Suara dari lapangan")}</p>

          <blockquote className="mt-6">
            <Quote
              className="size-8 text-brand-200 dark:text-brand-900"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p id="mz-kisah" className="mt-5 text-h1 text-balance text-ink">
              {t(STORY.quote)}
            </p>
          </blockquote>

          <footer className="mt-8 flex items-center gap-3 border-t border-line-soft pt-6">
            <div
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950"
            >
              <span className="mz-num text-sm font-semibold text-brand-700 dark:text-brand-300">
                SR
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{STORY.name}</p>
              <p className="text-xs text-ink-muted">{t(STORY.role)}</p>
            </div>
          </footer>

          <p className="mz-prose mt-6 text-sm text-ink-body">
            {t(STORY.context)}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="mz-card p-7">
            <h3 className="text-label tracking-[0.08em] text-ink-muted uppercase">
              {t("Bukti penyaluran")}
            </h3>

            <dl className="mt-6 flex flex-col divide-y divide-line-soft">
              {STORY.numbers.map((n) => (
                <div
                  key={n.label}
                  className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <dt className="text-sm text-ink-body">{t(n.label)}</dt>
                  <dd className="mz-num text-lg font-semibold text-ink">
                    {n.value}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href={`${SITE.explorer}/tx/${STORY.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300"
            >
              {t("Periksa transaksinya")}
              <ExternalLink
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
