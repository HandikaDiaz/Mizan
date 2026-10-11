type LockableMilestone = {
  lockedAt: string | null
}

type DisbursementMilestone = LockableMilestone & {
  status: string
}

type ProofMilestone = LockableMilestone & {
  status: string
}

export function canEditMilestone(milestone: LockableMilestone): boolean {
  return milestone.lockedAt === null
}

export function canRequestMilestoneDisbursement(
  milestone: DisbursementMilestone,
): boolean {
  return milestone.lockedAt !== null && milestone.status === "AI_VERIFIED"
}

export function canSubmitMilestoneProof(milestone: ProofMilestone): boolean {
  return milestone.lockedAt !== null && milestone.status === "PENDING"
}

export function canGenerateMilestoneTemplate(milestone: ProofMilestone): boolean {
  return milestone.lockedAt !== null && milestone.status === "PENDING"
}
