"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Clock, MapPin } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/components/site/language-provider"
import {
  convertAmount,
  formatCurrency,
  type DisplayCurrency,
  type MarketRates,
} from "@/src/lib/market-rates"
import { presentase, type Campaign } from "@/src/lib/site-data"

function Meta({ campaign }: { campaign: Campaign }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-label text-brand-700 dark:bg-brand-950 dark:text-brand-300">
        {t(campaign.kategori)}
      </span>
      <span className="mz-num inline-flex items-center gap-1 text-xs text-ink-muted">
        <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        {campaign.lokasi}
      </span>
      <span className="mz-num ml-auto inline-flex items-center gap-1 text-xs text-ink-muted">
        <Clock className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        {t("sisa")} {campaign.sisaHari} {t("hari")}
      </span>
    </div>
  )
}

function DisplayAmount({
  amount,
  unit,
  currency,
  rates,
}: {
  amount: number
  unit: Campaign["satuan"]
  currency: DisplayCurrency
  rates: MarketRates | null
}) {
  const converted = convertAmount(amount, unit, currency, rates)

  return (
    <span className="mz-num text-lg font-semibold text-ink">
      {converted === null
        ? `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(amount)} ${unit}`
        : formatCurrency(converted, currency)}
    </span>
  )
}

function Progres({
  campaign,
  currency,
  rates,
}: {
  campaign: Campaign
  currency: DisplayCurrency
  rates: MarketRates | null
}) {
  const { t } = useLanguage()
  const pct = presentase(campaign.terkumpul, campaign.target)

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <DisplayAmount
          amount={campaign.terkumpul}
          unit={campaign.satuan}
          currency={currency}
          rates={rates}
        />
        <p className="mz-num text-xs text-ink-muted">
          {t("target")}{" "}
          {currency === "BNB"
            ? `${campaign.target} ${campaign.satuan}`
            : t("terkonversi")}
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-100 dark:bg-brand-950"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Terkumpul ${pct} persen`}
      >
        <div
          className="h-full rounded-full bg-primary-purple"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mz-num mt-2 flex items-center justify-between gap-3 text-xs text-ink-muted">
        <span>
          {pct}% {t("tercapai")}
        </span>
        <span>
          {campaign.donatur} {t("donatur")}
        </span>
      </p>
    </div>
  )
}

function CommunityProfile({ campaign }: { campaign: Campaign }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-3 border-t border-line-soft pt-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft-lavender text-xs font-bold text-primary-purple">
        {campaign.komunitas.inisial}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">
          {campaign.komunitas.nama}
        </p>
        <p className="flex items-center gap-1 text-xs text-ink-muted">
          <BadgeCheck
            className="size-3.5 text-brand-violet"
            strokeWidth={1.7}
            aria-hidden="true"
          />
          {t(campaign.komunitas.tipe)}
        </p>
      </div>
      <span className="ml-auto shrink-0 text-xs font-semibold text-primary-purple">
        {t("Profil")}
      </span>
    </div>
  )
}

export function CampaignCard({
  campaign,
  variant = "default",
  currency = "BNB",
  rates = null,
}: {
  campaign: Campaign
  variant?: "default" | "featured"
  currency?: DisplayCurrency
  rates?: MarketRates | null
}) {
  const { t } = useLanguage()
  const featured = variant === "featured"
  const detailHref = `/campaigns/${campaign.id}`

  return (
    <article
      className={cn(
        "mz-card group flex flex-col overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md",
        featured && "lg:grid lg:grid-cols-[1.05fr_0.95fr]"
      )}
    >
      <Link
        href={detailHref}
        className={cn(
          "relative block aspect-[16/9] overflow-hidden bg-brand-100",
          featured && "lg:aspect-auto lg:min-h-full"
        )}
        aria-label={`${t("Lihat kampanye")} ${t(campaign.judul)}`}
      >
        <Image
          src={campaign.gambar}
          alt={`Ilustrasi ${campaign.judul}`}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 33vw, 100vw"
          }
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/65 via-primary-purple/5 to-transparent" />
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-primary-purple backdrop-blur-sm">
          {t("Lihat kampanye")}
          <ArrowRight
            className="size-3.5"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
      </Link>

      <div
        className={cn("flex flex-col gap-5 p-6 sm:p-7", featured && "lg:p-9")}
      >
        <Meta campaign={campaign} />

        <div>
          <h3
            className={cn(
              "text-balance text-ink",
              featured ? "text-h1" : "text-h3"
            )}
          >
            <Link
              href={detailHref}
              className="transition-colors hover:text-primary-purple"
            >
              {t(campaign.judul)}
            </Link>
          </h3>
          <p
            className={cn(
              "mz-prose mt-3 text-ink-body",
              featured ? "text-body-lg" : "text-sm"
            )}
          >
            {t(campaign.ringkas)}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-5">
          <Progres campaign={campaign} currency={currency} rates={rates} />
          <CommunityProfile campaign={campaign} />
        </div>
      </div>
    </article>
  )
}
