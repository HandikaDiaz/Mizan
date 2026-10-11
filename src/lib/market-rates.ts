"use client"

import * as React from "react"

export type DisplayCurrency = "BNB" | "USD" | "IDR"

export type MarketRates = {
  bnbUsd: number
  bnbIdr: number
  usdIdr: number
  lastUpdatedAt: number | null
}

export const CURRENCY_OPTIONS: {
  value: DisplayCurrency
  label: string
  symbol: string
}[] = [
  { value: "BNB", label: "BNB", symbol: "BNB" },
  { value: "USD", label: "USD", symbol: "$" },
  { value: "IDR", label: "Rupiah", symbol: "Rp" },
]

export function useMarketRates() {
  const [rates, setRates] = React.useState<MarketRates | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    fetch("/api/market-rates")
      .then((response) => {
        if (!response.ok) throw new Error("Kurs tidak tersedia")
        return response.json() as Promise<MarketRates>
      })
      .then((nextRates) => {
        if (active) setRates(nextRates)
      })
      .catch(() => {
        if (active) setRates(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { rates, loading }
}

export function convertAmount(
  amount: number,
  sourceUnit: "BNB" | "USDT",
  currency: DisplayCurrency,
  rates: MarketRates | null,
) {
  if (!rates) return null

  const amountInUsd = sourceUnit === "BNB" ? amount * rates.bnbUsd : amount

  if (currency === "USD") return amountInUsd
  if (currency === "IDR") return amountInUsd * rates.usdIdr
  return sourceUnit === "BNB" ? amount : amountInUsd / rates.bnbUsd
}

export function formatCurrency(
  amount: number,
  currency: DisplayCurrency,
) {
  if (currency === "BNB") {
    return `${new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} BNB`
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "IDR" ? 0 : 2,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(amount)
}

export function formatLastUpdated(timestamp: number | null) {
  if (!timestamp) return "Kurs harian"

  return `Diperbarui ${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1000))}`
}
