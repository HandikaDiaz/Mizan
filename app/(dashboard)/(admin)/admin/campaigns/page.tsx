import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { CampaignTable } from "@/components/dashboard/campaign-table"
import { getCampaigns } from "./actions"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Kampanye — Panel Admin",
}

export default async function KampanyePage() {
  const campaigns = await getCampaigns()

  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mz-overline">
            <LocalizedText text="Panel Admin" />
          </p>
          <h1 className="mt-3 text-h1 text-ink">
            <LocalizedText text="Kampanye" />
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
        </div>
        <Link
          href="/admin/campaigns/create"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[10px] bg-brand-700 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600 active:bg-brand-800"
        >
          <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
          <LocalizedText text="Tambah Kampanye" />
        </Link>
      </div>

      {/* Tabel kampanye */}
      <CampaignTable campaigns={campaigns} />
    </div>
  )
}
