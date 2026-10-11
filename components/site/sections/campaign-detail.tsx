"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  ExternalLink,
  FileCheck2,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { useState } from "react"

import { SitePreferences } from "@/components/site/layout/site-preferences"
import { useLanguage } from "@/components/site/language-provider"
import {
  convertAmount,
  formatCurrency,
  useMarketRates,
  type DisplayCurrency,
} from "@/src/lib/market-rates"
import { SITE, type Campaign } from "@/src/lib/site-data"
import { mzBtn } from "@/components/site/ui/mz-button"
import { presentase } from "@/src/lib/site-data"

export function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const [currency, setCurrency] = useState<DisplayCurrency>("BNB")
  const { rates, loading } = useMarketRates()
  const { t } = useLanguage()
  const pct = presentase(campaign.terkumpul, campaign.target)
  const collected = convertAmount(
    campaign.terkumpul,
    campaign.satuan,
    currency,
    rates
  )
  const target = convertAmount(
    campaign.target,
    campaign.satuan,
    currency,
    rates
  )

  return (
    <main className="bg-very-light-purple">
      <section className="mx-auto max-w-[1240px] px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-12 lg:pb-24">
        <Link
          href="/#kampanye"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-purple transition-colors hover:text-brand-violet"
        >
          <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden="true" />
          {t("Kembali ke kampanye")}
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)] lg:items-start lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line-soft bg-soft-lavender shadow-sm lg:sticky lg:top-28">
            <Image
              src={campaign.gambar}
              alt={`Ilustrasi ${campaign.judul}`}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/70 via-transparent to-transparent" />
            <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white sm:right-7 sm:bottom-7 sm:left-7">
              <div>
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary-purple backdrop-blur-sm">
                  {t(campaign.kategori)}
                </span>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-white/90">
                  <MapPin
                    className="size-4"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  {campaign.lokasi}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                <Clock
                  className="size-3.5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                {campaign.sisaHari} {t("hari lagi")}
              </span>
            </div>
          </div>

          <div>
            <p className="mz-overline">{t("Kampanye terverifikasi")}</p>
            <h1 className="mt-4 text-h1 text-balance text-ink">
              {t(campaign.judul)}
            </h1>
            <p className="mz-prose mt-5 text-ink-body">{t(campaign.ringkas)}</p>

            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-line-soft bg-surface p-4 shadow-xs">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-lavender font-bold text-primary-purple">
                {campaign.komunitas.inisial}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  {campaign.komunitas.nama}
                  <BadgeCheck
                    className="size-4 text-brand-violet"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {t(campaign.komunitas.tipe)}
                </p>
              </div>
              {campaign.komunitas.id ? (
                <Link
                  href={`/organizations/${campaign.komunitas.id}`}
                  className="ml-auto shrink-0 text-xs font-semibold text-primary-purple hover:underline"
                >
                  {t("Lihat profil")}
                </Link>
              ) : null}
            </div>

            <div className="mt-7 rounded-2xl border border-line-soft bg-surface p-5 shadow-xs sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.08em] text-ink-muted uppercase">
                    {t("Terkumpul")}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
                    {collected === null
                      ? `${campaign.terkumpul} ${campaign.satuan}`
                      : formatCurrency(collected, currency)}
                  </p>
                </div>
                <p className="text-right text-xs text-ink-muted">
                  {t("target")}
                  <br />
                  <span className="font-semibold text-ink-body">
                    {target === null
                      ? `${campaign.target} ${campaign.satuan}`
                      : formatCurrency(target, currency)}
                  </span>
                </p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-primary-purple"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-ink-muted">
                <span>
                  {pct}% {t("tercapai")}
                </span>
                <span>
                  {campaign.donatur} {t("donatur")}
                </span>
              </div>

              <Link
                href={`/benefactor?campaignId=${encodeURIComponent(campaign.id)}#donasi`}
                className={mzBtn("primary", "lg", "mt-6 w-full")}
              >
                {t("Donasi sekarang")}
                <ArrowRight
                  className="size-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Dana tercatat", icon: FileCheck2 },
                { label: "Kontrak publik", icon: ShieldCheck },
                { label: "Tanpa perantara", icon: WalletCards },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-surface/70 px-3 py-3 text-xs font-medium text-ink-muted"
                >
                  <Icon
                    className="size-4 shrink-0 text-brand-violet"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="donasi" className="border-t border-line-soft bg-surface">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <p className="mz-overline">Tentang kampanye</p>
            <h2 className="mt-3 text-h2 text-ink">
              Dana yang sampai, bukan sekadar janji.
            </h2>
            <p className="mz-prose mt-5 max-w-[60ch] text-ink-body">
              {t(campaign.ringkas)}{" "}
              {t(
                "Setiap donasi masuk ke kontrak pintar dan bisa ditelusuri melalui alamat kontrak publik. Penyaluran dilakukan berdasarkan bukti yang dapat diperiksa."
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-line-soft bg-very-light-purple p-6">
            <p className="text-sm font-semibold text-ink">
              {t("Profil komunitas")}
            </p>
            {campaign.komunitas.id ? (
              <Link href={`/organizations/${campaign.komunitas.id}`} className="mt-3 inline-flex text-sm font-semibold text-primary-purple hover:underline">
                {t("Lihat profil organisasi")}
              </Link>
            ) : null}
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              {t(campaign.komunitas.bio)}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-5 text-xs text-ink-muted">
              <span>{t(campaign.komunitas.tipe)}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary-purple">
                <BadgeCheck
                  className="size-3.5"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {t("Terverifikasi")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-very-light-purple">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-ink">
              {t("Periksa jejak donasi")}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {t("Kontrak publik di BNB Smart Chain Testnet.")}
            </p>
          </div>
          <a
            href={`${SITE.explorer}/address/${SITE.contract}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-purple hover:text-brand-violet"
          >
            {t("Buka BscScan")}
            <ExternalLink
              className="size-4"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </a>
        </div>
      </section>

      <SitePreferences
        currency={currency}
        onCurrencyChange={setCurrency}
        loading={loading}
        lastUpdatedAt={rates?.lastUpdatedAt ?? null}
      />
    </main>
  )
}
