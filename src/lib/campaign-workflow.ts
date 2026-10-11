export type CampaignReviewStatus =
  "AI_DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"

export type CampaignFormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

const allowedTransitions: Record<CampaignReviewStatus, CampaignReviewStatus[]> =
  {
    AI_DRAFT: ["PENDING_REVIEW", "APPROVED"],
    PENDING_REVIEW: ["APPROVED", "REJECTED"],
    APPROVED: [],
    REJECTED: ["PENDING_REVIEW"],
  }

export function transitionCampaignReviewStatus(
  current: CampaignReviewStatus,
  next: CampaignReviewStatus
) {
  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Transisi campaign tidak valid: ${current} → ${next}`)
  }
  return next
}
