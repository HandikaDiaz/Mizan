const AI_CONFIDENCE_THRESHOLD = 0.5

export type MilestoneVerificationStatus = "AI_VERIFIED" | "MANUAL_REVIEW"

export const resolveMilestoneVerificationStatus = (result: {
  verified: boolean
  confidence: number
}): MilestoneVerificationStatus => {
  if (result.verified && result.confidence >= AI_CONFIDENCE_THRESHOLD) {
    return "AI_VERIFIED"
  }

  return "MANUAL_REVIEW"
}
