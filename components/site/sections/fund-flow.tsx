import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react"

import { SectionHead } from "@/components/site/ui/section-head"
import { FUND_FLOW, SITE } from "@/src/lib/site-data"

/**
 * Alur dana — inti pembeda produk.
 * Setiap simpul menyertakan contoh alamat dan hash yang bisa diperiksa,
 * supaya klaim "bisa diaudit" tidak berhenti jadi slogan.
 */

export function FundFlow() {
  return (
    <section id="alur-dana" className="mz-section bg-surface-sunken">
      <div className="mz-container">
        <SectionHead
          overline="Transparansi"
          title="Contoh alur satu donasi, dari dompet ke penerima"
          desc="Ini jejak satu donasi 0,5 BNB yang sudah selesai disalurkan. Semua nomor di bawah bisa kamu buka sendiri di explorer."
        />

        <ol className="mt-12 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {FUND_FLOW.map((node, i) => (
            <li key={node.role} className="flex flex-col gap-4">
              <div className="mz-card flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-h3 text-ink">{node.role}</p>
                  <span className="mz-num rounded-full border border-line-soft px-2.5 py-1 text-xs text-ink-muted">
                    blok {node.block}
                  </span>
                </div>

                <p className="mz-num text-sm text-ink-body">{node.action}</p>

                <dl className="mt-auto flex flex-col gap-2.5 border-t border-line-soft pt-4">
                  <div className="flex flex-col gap-1">
                    <dt className="mz-num text-xs text-ink-muted">Dompet</dt>
                    <dd className="mz-mono truncate rounded-sm bg-surface-sunken px-2 py-1.5 text-xs text-ink">
                      {node.address}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="mz-num text-xs text-ink-muted">Transaksi</dt>
                    <dd>
                      <a
                        href={`${SITE.explorer}/tx/${node.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mz-mono inline-flex min-h-11 items-center gap-1.5 rounded-sm bg-surface-sunken px-2 text-xs text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300"
                      >
                        {node.hash}
                        <ExternalLink
                          className="size-3"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {i < FUND_FLOW.length - 1 ? (
                <div
                  className="flex items-center justify-center gap-2 text-ink-muted lg:hidden"
                  aria-hidden="true"
                >
                  <ArrowDown className="size-4" strokeWidth={1.5} />
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="mt-6 flex items-center gap-2 mz-num text-xs text-ink-muted">
          <ArrowRight
            className="hidden size-4 lg:block"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Alamat dan hash di atas adalah contoh demo pada jaringan uji. Saat
          kontrak sungguhan berjalan, tautannya akan mengarah ke transaksi nyata.
        </p>
      </div>
    </section>
  )
}
