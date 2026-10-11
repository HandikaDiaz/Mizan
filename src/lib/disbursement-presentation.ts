const READY_STATUSES = [
  "AI_VERIFIED",
  "MANUAL_REVIEW",
  "ADMIN_APPROVED",
  "CHAIN_PENDING",
  "CHAIN_FAILED",
  "DISBURSED",
] as const

export function isMilestoneReadyForDisbursement(status: string): boolean {
  return (READY_STATUSES as readonly string[]).includes(status)
}

export function isMilestoneVisibleOnDisbursementPage(
  status: string,
  locked: boolean,
): boolean {
  return locked && (status === "PENDING" || isMilestoneReadyForDisbursement(status))
}
