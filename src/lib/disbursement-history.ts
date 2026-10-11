export type DisbursedMilestone = {
  id: number
  order: number
  description: string
  amountWei: string
  proofImageUrl: string | null
  proofNote: string | null
  disbursementTxHash: string | null
  disbursementRequestedAt: string | null
  updatedAt: string | null
}

export type PublicDisbursementHistoryItem = {
  id: string
  milestone: string
  milestoneOrder: number
  amountWei: string
  currency: string
  description: string
  region: string
  proofUrl: string | null
  transactionHash: string | null
  createdAt: string
  campaignTitle?: string
}

export const toPublicDisbursementHistoryItem = (
  milestone: DisbursedMilestone,
  currency: string,
  proofUrl: string | null
): PublicDisbursementHistoryItem => ({
  id: String(milestone.id),
  milestone: milestone.description,
  milestoneOrder: milestone.order,
  amountWei: milestone.amountWei,
  currency,
  description: milestone.proofNote?.trim() || milestone.description,
  region: "Indonesia",
  proofUrl,
  transactionHash: milestone.disbursementTxHash,
  createdAt: milestone.updatedAt ?? milestone.disbursementRequestedAt ?? "",
})

export const sortPublicDisbursementHistory = (
  items: PublicDisbursementHistoryItem[]
): PublicDisbursementHistoryItem[] =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
