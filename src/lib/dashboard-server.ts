import "server-only"

import { db } from "@/src/prisma/db"

export type LiveCampaignSnapshot = {
  id: string
  title: string
  organizerName: string
  targetAmountWei: string
  fundedAmountWei: string
  paymentCount: number
  contributorCount: number
  recipientWallet: string | null
  contractAddress: string | null
  contractCampaignId: string | null
  chainId: number | null
  onchainStatus: "NOT_REGISTERED" | "REGISTERING" | "REGISTERED" | "FAILED"
  latestTransactionHash: string | null
  latestPaymentAt: string | null
}

export function formatWeiBnb(value: string) {
  const wei = BigInt(value || "0")
  const whole = wei / BigInt("1000000000000000000")
  const fraction = (wei % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")

  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export async function getLiveCampaignSnapshots(communityId?: number) {
  const campaigns = await db.orm.public.Campaign
    .where(
      communityId === undefined
        ? { reviewStatus: 'APPROVED', status: 'ACTIVE' }
        : { communityId, reviewStatus: 'APPROVED', status: 'ACTIVE' },
    )
    .orderBy((campaign) => campaign.createdAt.desc())
    .all()

  return Promise.all(
    campaigns.map(async (campaign): Promise<LiveCampaignSnapshot> => {
      const payments = await db.orm.public.CampaignPayment.where({
        campaignId: campaign.id,
      }).all()
      const confirmed = payments.filter(
        (payment) => payment.status === "CONFIRMED"
      )
      const fundedAmountWei = confirmed
        .reduce(
          (total, payment) => total + BigInt(payment.amountWei),
          BigInt(0)
        )
        .toString()
      const latestPayment = confirmed[confirmed.length - 1]

      return {
        id: String(campaign.id),
        title: campaign.title,
        organizerName: campaign.organizerName,
        targetAmountWei: campaign.targetAmountWei,
        fundedAmountWei,
        paymentCount: confirmed.length,
        contributorCount: new Set(confirmed.map((payment) => payment.donorId))
          .size,
        recipientWallet: campaign.recipientWallet,
        contractAddress: campaign.contractAddress,
        contractCampaignId: campaign.contractCampaignId,
        chainId: campaign.chainId,
        onchainStatus: campaign.onchainStatus,
        latestTransactionHash: latestPayment?.transactionHash ?? null,
        latestPaymentAt: latestPayment?.createdAt ?? null,
      }
    })
  )
}
