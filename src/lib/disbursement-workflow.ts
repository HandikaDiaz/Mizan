export const DISBURSEMENT_REQUEST_STATUSES = [
  "SUBMITTED",
  "AI_VERIFIED",
  "MANUAL_REVIEW",
  "REJECTED",
  "ADMIN_APPROVED",
  "CHAIN_PENDING",
  "DISBURSED",
  "CHAIN_FAILED",
] as const

export type DisbursementRequestStatus =
  (typeof DISBURSEMENT_REQUEST_STATUSES)[number]

export const ACTIVE_DISBURSEMENT_STATUSES = [
  "SUBMITTED",
  "AI_VERIFIED",
  "MANUAL_REVIEW",
  "ADMIN_APPROVED",
  "CHAIN_PENDING",
  "CHAIN_FAILED",
] as const satisfies readonly DisbursementRequestStatus[]

export const VALID_DISBURSEMENT_TRANSITIONS: Record<
  DisbursementRequestStatus,
  readonly DisbursementRequestStatus[]
> = {
  SUBMITTED: ["AI_VERIFIED", "MANUAL_REVIEW", "REJECTED"],
  AI_VERIFIED: ["ADMIN_APPROVED", "REJECTED"],
  MANUAL_REVIEW: ["ADMIN_APPROVED", "REJECTED"],
  ADMIN_APPROVED: ["CHAIN_PENDING"],
  CHAIN_PENDING: ["DISBURSED", "CHAIN_FAILED"],
  CHAIN_FAILED: ["CHAIN_PENDING"],
  REJECTED: [],
  DISBURSED: [],
}

export function canTransitionDisbursementRequest(
  current: DisbursementRequestStatus,
  next: DisbursementRequestStatus,
) {
  return VALID_DISBURSEMENT_TRANSITIONS[current].includes(next)
}

export function transitionDisbursementRequest(
  current: DisbursementRequestStatus,
  next: DisbursementRequestStatus,
) {
  if (!canTransitionDisbursementRequest(current, next)) {
    throw new Error(`Transisi pencairan tidak valid: ${current} → ${next}`)
  }
  return next
}

export function isActiveDisbursementStatus(
  status: DisbursementRequestStatus,
): boolean {
  return (ACTIVE_DISBURSEMENT_STATUSES as readonly string[]).includes(status)
}

export type DisbursementAdminAction =
  | "APPROVE"
  | "REJECT"
  | "RELEASE"
  | "CHECK"
  | "RETRY"

export function getDisbursementAdminActions(
  status: DisbursementRequestStatus,
): readonly DisbursementAdminAction[] {
  if (status === "AI_VERIFIED" || status === "MANUAL_REVIEW") {
    return ["APPROVE", "REJECT"]
  }
  if (status === "ADMIN_APPROVED") return ["RELEASE"]
  if (status === "CHAIN_PENDING") return ["CHECK"]
  if (status === "CHAIN_FAILED") return ["RETRY"]
  return []
}
