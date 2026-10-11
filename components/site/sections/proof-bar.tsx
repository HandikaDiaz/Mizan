"use client"

import { ExternalLink } from "lucide-react"

import { useLanguage } from "@/components/site/language-provider"
import { PROOFS, SITE } from "@/src/lib/site-data"

/**
 * Bilah bukti. Menggantikan strip "Trusted by <logo>" gaya lama, yang
 * hanya klaim tanpa bukti. Isinya fakta yang bisa diverifikasi di explorer.
 * Lihat DESIGN.md §2 butir 7.
 */

export function ProofBar() {
  const { t } = useLanguage()

  return (
    <section
      className="border-y border-line-soft bg-surface"
      aria-label={t("Bukti on-chain")}
    >
      <div className="mz-container grid grid-cols-1 divide-y divide-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {PROOFS.map(
          (p: {
            value: string
            unit: string
            label: string
            detail: string
          }) => (
            <div
              key={p.label}
              className="px-0 py-7 sm:px-7 sm:first:pl-0 sm:last:pr-0"
            >
              <p className="mz-num text-h2 text-ink">
                {p.value}
                <span className="align-middle text-label font-medium tracking-normal text-ink-muted normal-case">
                  {" "}
                  {p.unit}
                </span>
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {t(p.label)}
              </p>
              <p className="mz-prose mt-1 text-sm text-ink-muted">
                {t(p.detail)}
              </p>
            </div>
          )
        )}
      </div>

      <div className="border-t border-line-soft">
        <div className="mz-container flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="mz-num text-xs text-ink-muted">
            {t("Kontrak")}:{" "}
            <span className="text-ink-body">{SITE.contractShort}</span>
          </p>
          <a
            href={`${SITE.explorer}/address/${SITE.contract}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300"
          >
            {t("Periksa di BscScan")}
            <ExternalLink
              className="size-3.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
