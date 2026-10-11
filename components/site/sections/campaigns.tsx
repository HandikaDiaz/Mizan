"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"

import Link from "next/link"

import { CampaignCard } from "@/components/site/ui/campaign-card"
import { SectionHead } from "@/components/site/ui/section-head"
import { SitePreferences } from "@/components/site/layout/site-preferences"
import { useLanguage } from "@/components/site/language-provider"
import { useMarketRates, type DisplayCurrency } from "@/src/lib/market-rates"
import type { Campaign } from "@/src/lib/site-data"

export function Campaigns({ campaigns = [] }: { campaigns?: Campaign[] }) {
  const [currency, setCurrency] = useState<DisplayCurrency>("BNB")
  const { rates, loading } = useMarketRates()
  const { t } = useLanguage()

  // Newest campaign leads as the featured card; the next ones fill the grid.
  const [featured, ...rest] = campaigns
  const secondary = rest.slice(0, 3)

  if (!featured) {
    return null
  }

  return (
    <section id="kampanye" className="mz-section bg-surface-sunken">
      <div className="mz-container">
        <SectionHead
          overline={t("Kampanye")}
          title={t("Yang sedang berjalan")}
          desc={t(
            "Pilih kampanye yang ingin kamu dukung. Setiap pencairan tercatat dan dapat diperiksa siapa pun."
          )}
          align="between"
          action={
            <Link
              href="/campaigns"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300"
            >
              {t("Lihat semua kampanye")}
              <ArrowRight
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          }
        />

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <CampaignCard
              campaign={featured}
              variant="featured"
              currency={currency}
              rates={rates}
            />
          </div>
          {secondary.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              currency={currency}
              rates={rates}
            />
          ))}
        </div>
      </div>

      <SitePreferences
        currency={currency}
        onCurrencyChange={setCurrency}
        loading={loading}
        lastUpdatedAt={rates?.lastUpdatedAt ?? null}
      />
    </section>
  )
}
