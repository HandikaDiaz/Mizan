import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { BeneficiaryCampaignForm } from "@/components/dashboard/beneficiary-campaign-form"
import { getBeneficiaryCampaignById, updateBeneficiaryCampaign } from "../../actions"

export const metadata: Metadata = {
  title: "Edit Kampanye — Penerima Manfaat",
}

export default async function EditKampanyePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getBeneficiaryCampaignById(id)

  if (!campaign) notFound()

  const updateWithId = updateBeneficiaryCampaign.bind(null, id)

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Breadcrumb */}
      <Link
        href="/beneficiary/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Kampanye Saya
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">Penerima Manfaat</p>
        <h1 className="mt-3 text-h1 text-ink">Edit Kampanye</h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          {campaign.title}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8">
        <BeneficiaryCampaignForm
          action={updateWithId}
          initialData={campaign}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  )
}
