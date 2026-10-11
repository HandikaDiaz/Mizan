"use client"

import { useMemo, useState } from "react"
import { Search, SearchX } from "lucide-react"

import { CampaignCard } from "@/components/site/ui/campaign-card"
import { SitePreferences } from "@/components/site/layout/site-preferences"
import { useLanguage } from "@/components/site/language-provider"
import { useMarketRates, type DisplayCurrency } from "@/src/lib/market-rates"
import { cn } from "@/src/lib/utils"
import type { Campaign } from "@/src/lib/site-data"

type CampaignBrowserProps = {
  campaigns: Campaign[]
  categories: readonly string[]
}

const ALL = "__all__"

/**
 * Client-side search + category filter over the campaigns fetched on the
 * server. Keeping the filter on the client avoids a round-trip per keystroke;
 * the full list is small (only APPROVED + ACTIVE campaigns).
 */
export function CampaignBrowser({ campaigns, categories }: CampaignBrowserProps) {
  const { t } = useLanguage()
  const [currency, setCurrency] = useState<DisplayCurrency>("BNB")
  const { rates, loading } = useMarketRates()

  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>(ALL)

  // Only show category chips that actually have at least one campaign.
  const availableCategories = useMemo(() => {
    const present = new Set(campaigns.map((campaign) => campaign.kategori))
    return categories.filter((category) => present.has(category))
  }, [campaigns, categories])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return campaigns.filter((campaign) => {
      const matchesCategory =
        activeCategory === ALL || campaign.kategori === activeCategory

      if (!matchesCategory) return false
      if (!needle) return true

      const haystack = [
        campaign.judul,
        campaign.penyelenggara,
        campaign.lokasi,
        campaign.ringkas,
        campaign.kategori,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [campaigns, query, activeCategory])

  const chipBase =
    "inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-label transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-purple"
  const chipOn = "bg-primary-purple text-white"
  const chipOff =
    "bg-surface text-ink-body border border-line-soft hover:bg-brand-50"

  return (
    <>
      {/* Controls: search + category filter */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Cari kampanye, penyelenggara, atau lokasi")}
            aria-label={t("Cari kampanye")}
            className="h-12 w-full rounded-sm border border-brand-200 bg-surface pr-4 pl-10 text-sm text-ink placeholder:text-ink-muted focus-visible:border-primary-purple focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-100"
          />
        </div>

        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label={t("Saring berdasarkan tipe kampanye")}
        >
          <button
            type="button"
            onClick={() => setActiveCategory(ALL)}
            aria-pressed={activeCategory === ALL}
            className={cn(chipBase, activeCategory === ALL ? chipOn : chipOff)}
          >
            {t("Semua")}
          </button>
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={cn(
                chipBase,
                activeCategory === category ? chipOn : chipOff,
              )}
            >
              {t(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
            {filtered.length} {t("kampanye ditemukan")}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                currency={currency}
                rates={rates}
              />
            ))}
          </div>
        </>
      ) : (
        <div
          className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-line-soft bg-surface px-6 py-16 text-center"
          aria-live="polite"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-soft-lavender text-primary-purple">
            <SearchX className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 text-h3 text-ink">
            {t("Belum ada kampanye yang cocok")}
          </p>
          <p className="mt-2 max-w-md text-sm text-ink-muted">
            {query || activeCategory !== ALL
              ? t(
                  "Coba ubah kata kunci atau pilih tipe kampanye yang berbeda.",
                )
              : t(
                  "Kampanye aktif akan muncul di sini begitu diverifikasi dan dipublikasikan.",
                )}
          </p>
        </div>
      )}

      <SitePreferences
        currency={currency}
        onCurrencyChange={setCurrency}
        loading={loading}
        lastUpdatedAt={rates?.lastUpdatedAt ?? null}
      />
    </>
  )
}
