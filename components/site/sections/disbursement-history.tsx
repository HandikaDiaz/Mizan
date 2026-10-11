"use client"

import { ExternalLink, FileCheck2, Link2 } from "lucide-react"

import { useLanguage } from "@/components/site/language-provider"
import type { PublicDisbursementHistoryItem } from "@/src/lib/disbursement-history"

export function DisbursementHistory({
  items,
  title = "Histori penggunaan dana",
}: {
  items: PublicDisbursementHistoryItem[]
  title?: string
}) {
  const { language, t } = useLanguage()

  return (
    <section className="mt-12" aria-labelledby="disbursement-history-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mz-overline">{t("Transparansi")}</p>
          <h2 id="disbursement-history-title" className="mt-3 text-h2 text-ink">
            {t(title)}
          </h2>
        </div>
        {items.length > 0 ? (
          <span className="inline-flex w-fit rounded-full bg-soft-lavender px-3 py-1 text-xs font-semibold text-primary-purple">
            {items.length} {t("penyaluran")}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-soft bg-surface p-8 text-center">
          <FileCheck2
            className="mx-auto size-8 text-brand-violet/70"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-ink">
            {t("Belum ada penyaluran yang dipublikasikan")}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink-muted">
            {t(
              "Histori akan muncul setelah milestone selesai disalurkan dan berstatus DISBURSED."
            )}
          </p>
        </div>
      ) : (
        <div className="relative mt-6 space-y-4 before:absolute before:top-6 before:bottom-6 before:left-[1.05rem] before:w-px before:bg-line-soft sm:before:left-[1.3rem]">
          {items.map((item) => (
            <article key={item.id} className="relative pl-10 sm:pl-12">
              <div className="absolute top-5 left-0 flex size-[2.15rem] items-center justify-center rounded-full border-4 border-very-light-purple bg-brand-violet text-white shadow-sm sm:size-[2.6rem]">
                <FileCheck2
                  className="size-4 sm:size-[1.1rem]"
                  aria-hidden="true"
                />
              </div>
              <div className="rounded-2xl border border-line-soft bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    {item.campaignTitle ? (
                      <p className="text-xs font-semibold tracking-[0.08em] text-brand-violet uppercase">
                        {item.campaignTitle}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-base font-semibold text-ink">
                      {item.milestone}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-soft-lavender px-3 py-2 sm:min-w-36 sm:text-right">
                    <p className="font-mono text-sm font-bold text-ink tabular-nums">
                      {formatWei(item.amountWei)} {item.currency}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDate(item.createdAt, language)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-4 text-xs text-ink-muted">
                  <span>
                    {t("Wilayah")}: {item.region}
                  </span>
                  {item.transactionHash ? (
                    <span
                      className="inline-flex items-center gap-1 font-mono"
                      title={item.transactionHash}
                    >
                      <Link2 className="size-3.5" aria-hidden="true" />
                      Tx {shortenHash(item.transactionHash)}
                    </span>
                  ) : null}
                  {item.proofUrl ? (
                    <a
                      href={item.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary-purple hover:underline"
                    >
                      {t("Lihat bukti")}{" "}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function formatWei(value: string) {
  try {
    const big = BigInt(value || "0")
    const whole = big / BigInt("1000000000000000000")
    const fraction = (big % BigInt("1000000000000000000"))
      .toString()
      .padStart(18, "0")
      .slice(0, 4)
      .replace(/0+$/, "")
    return `${whole}${fraction ? `.${fraction}` : ""}`
  } catch {
    return "0"
  }
}

function formatDate(value: string, language: "id" | "en") {
  if (!value)
    return language === "en" ? "Date unavailable" : "Tanggal belum tersedia"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? language === "en"
      ? "Date unavailable"
      : "Tanggal belum tersedia"
    : date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
}

function shortenHash(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value
}
