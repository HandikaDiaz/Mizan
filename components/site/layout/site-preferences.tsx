"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Coins, RefreshCw, Settings2, X, type LucideIcon } from "lucide-react"

import { useLanguage } from "@/components/site/language-provider"
import { Button } from "@/components/ui/button"
import {
  CURRENCY_OPTIONS,
  formatLastUpdated,
  type DisplayCurrency,
} from "@/src/lib/market-rates"
import { cn } from "cn"

type SitePreferencesProps = {
  currency: DisplayCurrency
  onCurrencyChange: (currency: DisplayCurrency) => void
  lastUpdatedAt: number | null
  loading?: boolean
}

const copy = {
  id: {
    open: "Buka preferensi",
    close: "Tutup preferensi",
    title: "Preferensi tampilan",
    currency: "Tampilkan dalam",
    loading: "Memuat kurs harian...",
  },
  en: {
    open: "Open preferences",
    close: "Close preferences",
    title: "Display preferences",
    currency: "Display in",
    loading: "Loading daily rates...",
  },
} as const

export function SitePreferences({
  currency,
  onCurrencyChange,
  lastUpdatedAt,
  loading = false,
}: SitePreferencesProps) {
  const [open, setOpen] = React.useState(false)
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )
  const { language, setLanguage } = useLanguage()
  const labels = copy[language]
  const updatedLabel = formatLastUpdated(lastUpdatedAt)

  if (!mounted) {
    return null
  }

  return createPortal(
    <div className="fixed inset-x-4 bottom-4 z-[60] flex justify-end sm:left-auto sm:max-w-sm">
      {open ? (
        <div
          className="w-full overflow-hidden rounded-2xl border border-line-soft bg-surface/95 shadow-[0_18px_60px_rgba(37,33,42,0.18)] backdrop-blur-xl sm:w-[22rem]"
          role="dialog"
          aria-label={labels.title}
        >
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-soft-lavender text-primary-purple">
                <Settings2
                  className="size-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <p className="text-sm font-semibold text-ink">{labels.title}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
            >
              <X className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </div>

          <div className="space-y-4 p-4">
            <PreferenceRow icon={Coins} label={labels.currency}>
              <div
                className="flex rounded-xl bg-soft-lavender p-1"
                role="group"
                aria-label={labels.currency}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={currency === option.value ? "default" : "ghost"}
                    onClick={() => onCurrencyChange(option.value)}
                    className="min-w-0 flex-1 rounded-lg px-2.5"
                    aria-pressed={currency === option.value}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PreferenceRow>
            <PreferenceRow
              icon={Settings2}
              label={language === "en" ? "Language" : "Bahasa"}
            >
              <div
                className="flex rounded-xl bg-soft-lavender p-1"
                role="group"
                aria-label={language === "en" ? "Language" : "Bahasa"}
              >
                {(["id", "en"] as const).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={language === value ? "default" : "ghost"}
                    onClick={() => setLanguage(value)}
                    className="min-w-0 flex-1 rounded-lg px-2.5 uppercase"
                    aria-pressed={language === value}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </PreferenceRow>
          </div>

          <div className="flex items-center gap-1.5 border-t border-line-soft bg-very-light-purple px-4 py-3 text-[0.6875rem] text-ink-muted">
            <RefreshCw
              className={cn("size-3", loading && "animate-spin")}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>
              {loading
                ? labels.loading
                : language === "en"
                  ? updatedLabel
                      .replace("Diperbarui", "Updated")
                      .replace("Kurs harian", "Daily rate")
                  : updatedLabel}
            </span>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary-purple px-4 py-2.5 text-white shadow-[0_10px_30px_rgba(112,32,130,0.3)] hover:bg-brand-violet"
          aria-label={labels.open}
          aria-expanded={open}
        >
          <Settings2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
          <span className="hidden sm:inline">
            {language === "id" ? "Preferensi" : "Preferences"}
          </span>
        </Button>
      )}
    </div>,
    document.body
  )
}

function PreferenceRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-body">
        <Icon
          className="size-3.5 text-primary-purple"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}
