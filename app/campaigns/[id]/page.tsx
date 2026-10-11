import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { CampaignDetail } from "@/components/site/sections/campaign-detail"
import {
  getPublicCampaignById,
  getPublicDisbursementHistoryForCampaign,
} from "@/src/lib/campaigns-server"
import { DisbursementHistory } from "@/components/site/sections/disbursement-history"

// Detail always reflects the latest campaign row.
export const dynamic = "force-dynamic"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getPublicCampaignById(id)

  if (!campaign) notFound()
  const history = await getPublicDisbursementHistoryForCampaign(Number(id))

  return (
    <>
      <SiteHeader />
      <CampaignDetail campaign={campaign} />
      <div className="bg-very-light-purple px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1240px]">
          <DisbursementHistory items={history} />
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
