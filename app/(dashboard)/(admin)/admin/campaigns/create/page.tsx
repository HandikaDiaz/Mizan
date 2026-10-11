import type { Metadata } from "next"

import { CampaignForm } from "@/components/dashboard/campaign-form"
import { createMockAiCampaign } from "../actions"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Tambah Kampanye — Panel Admin",
}

// Halaman tambah kampanye baru
export default function TambahKampanyePage() {
  return (
    <div className="mx-auto max-w-[720px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">
          <LocalizedText text="Panel Admin" />
        </p>
        <h1 className="mt-3 text-h1 text-ink">
          <LocalizedText text="Tambah Kampanye" />
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8">
        <CampaignForm
          action={createMockAiCampaign}
          submitLabel="Tambah Kampanye"
        />
      </div>
    </div>
  )
}
