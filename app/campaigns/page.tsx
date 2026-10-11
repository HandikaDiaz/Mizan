import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { CampaignBrowser } from "@/components/site/sections/campaign-browser"
import { SectionHead } from "@/components/site/ui/section-head"
import {
  CAMPAIGN_CATEGORIES,
  getPublicCampaigns,
} from "@/src/lib/campaigns-server"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import type { Campaign } from "@/src/lib/site-data"

export const metadata: Metadata = {
  title: "Kampanye — Mizan",
  description:
    "Jelajahi kampanye zakat dan donasi yang sedang berjalan. Setiap pencairan tercatat on-chain dan bisa diperiksa siapa pun.",
}

// Always reflect the latest campaigns: this route reads live rows per request.
export const dynamic = "force-dynamic"

export default async function KampanyePage() {
  let campaigns: Campaign[] = []
  let failed = false

  try {
    campaigns = await getPublicCampaigns()
  } catch {
    failed = true
  }

  return (
    <>
      <SiteHeader />
      <main className="mz-section bg-surface-sunken">
        <div className="mz-container">
          <SectionHead
            overline="Kampanye"
            title="Kampanye yang sedang berjalan"
            desc="Pilih kampanye yang ingin kamu dukung. Setiap pencairan tercatat di kontrak publik dan dapat diperiksa siapa pun."
          />

          <p className="mt-4 text-xs text-ink-muted">{TESTNET_NOTICE}</p>

          {failed ? (
            <div
              className="mt-8 flex flex-col items-center justify-center rounded-lg border border-coral/40 bg-surface px-6 py-16 text-center"
              role="alert"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-coral/10 text-coral">
                <TriangleAlert
                  className="size-6"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
              <p className="mt-4 text-h3 text-ink">Gagal memuat kampanye</p>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Data kampanye sedang tidak dapat diakses. Coba muat ulang
                halaman ini beberapa saat lagi.
              </p>
            </div>
          ) : (
            <CampaignBrowser
              campaigns={campaigns}
              categories={CAMPAIGN_CATEGORIES}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
