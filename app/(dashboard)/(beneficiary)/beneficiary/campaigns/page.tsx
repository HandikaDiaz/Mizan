import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getBeneficiaryCampaigns, type BeneficiaryCampaign } from "./actions"
import { BeneficiaryCampaignGrid } from "@/components/dashboard/beneficiary-campaign-grid"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Kampanye Saya — Penerima Manfaat",
}

export default async function KampanyeSayaPage() {
  const campaigns: BeneficiaryCampaign[] = await getBeneficiaryCampaigns()

  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mz-overline"><LocalizedText text="Penerima Manfaat" /></p>
          <h1 className="mt-3 text-h1 text-ink"><LocalizedText text="Kampanye Saya" /></h1>
          <p className="mt-2 text-sm text-ink-muted">
            <LocalizedText text="Kelola kampanye, milestone, bukti penggunaan dana, dan pencairan." />
          </p>
        </div>
        <Link
          href="/beneficiary/campaigns/create"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[10px] bg-brand-700 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-600 active:bg-brand-800"
        >
          <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
          <LocalizedText text="Buat Kampanye Baru" />
        </Link>
      </div>

      {/* Content */}
      <BeneficiaryCampaignGrid campaigns={campaigns} />
    </div>
  )
}
