import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CampaignForm } from "@/components/dashboard/campaign-form"
import { getCampaignById, updateCampaign } from "../../actions"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Edit Kampanye — Panel Admin",
}

// Halaman edit kampanye
export default async function EditKampanyePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getCampaignById(id)

  if (!campaign) {
    notFound()
  }

  // Bind id ke updateCampaign sehingga form hanya perlu (state, formData)
  const updateWithId = updateCampaign.bind(null, id)

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">
          <LocalizedText text="Panel Admin" />
        </p>
        <h1 className="mt-3 text-h1 text-ink">
          <LocalizedText text="Edit Kampanye" />
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8">
        <CampaignForm
          action={updateWithId}
          initialData={campaign}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  )
}
