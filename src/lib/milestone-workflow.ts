export type MilestoneStatus =
  | "PENDING"
  | "PROOF_SUBMITTED"
  | "AI_VERIFIED"
  | "MANUAL_REVIEW"
  | "REJECTED"
  | "ADMIN_APPROVED"
  | "CHAIN_PENDING"
  | "DISBURSED"
  | "CHAIN_FAILED"

export type MilestoneAdminAction = "APPROVE" | "REJECT" | "DISBURSE" | "CHECK" | "RETRY"

const allowedTransitions: Record<MilestoneAdminAction, MilestoneStatus[]> = {
  APPROVE: ["PROOF_SUBMITTED", "AI_VERIFIED", "MANUAL_REVIEW"],
  REJECT: ["PROOF_SUBMITTED", "AI_VERIFIED", "MANUAL_REVIEW"],
  DISBURSE: ["ADMIN_APPROVED"],
  CHECK: ["CHAIN_PENDING"],
  RETRY: ["CHAIN_FAILED"],
}

export function canApplyMilestoneAdminAction(
  status: MilestoneStatus,
  action: MilestoneAdminAction,
): boolean {
  return allowedTransitions[action].includes(status)
}

export function milestoneAdminActionMessage(action: MilestoneAdminAction): string {
  if (action === "APPROVE") return "Pengajuan disetujui dan siap diproses on-chain."
  if (action === "REJECT") return "Bukti ditolak dan perlu dikirim ulang."
  if (action === "DISBURSE") return "Pencairan sedang diproses on-chain."
  if (action === "CHECK") return "Status transaksi on-chain diperiksa."
  return "Pencairan dicoba kembali."
}
