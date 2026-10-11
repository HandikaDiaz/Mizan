import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"

import { CampaignBrowser } from "@/components/site/sections/campaign-browser"
import {
  CAMPAIGN_CATEGORIES,
  getPublicCampaigns,
} from "@/src/lib/campaigns-server"
import { TESTNET_NOTICE, type Campaign } from "@/src/lib/site-data"

export const metadata: Metadata = {
  title: "Jelajahi Kampanye — Dashboard Donatur",
}

export const dynamic = "force-dynamic"

export default async function JelajahiKampanyePage() {
  let campaigns: Campaign[] = []
  let failed = false

  try {
    campaigns = await getPublicCampaigns()
  } catch {
    failed = true
  }

  return (
    <div className="mx-auto max-w-[1240px]">
      <div>
        <p className="mz-overline">Donatur</p>
        <h1 className="mt-3 text-h1 text-ink">Jelajahi Kampanye</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink-body">
          Temukan kampanye terverifikasi untuk didukung. Pencairan dana dan
          progres milestone dapat diperiksa secara transparan.
        </p>
        <p className="mt-2 text-xs text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

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
            Data kampanye sedang tidak dapat diakses. Coba muat ulang halaman
            ini beberapa saat lagi.
          </p>
        </div>
      ) : (
        <CampaignBrowser
          campaigns={campaigns}
          categories={CAMPAIGN_CATEGORIES}
        />
      )}
    </div>
  )
}
