import { describe, expect, it } from "vitest"
import { canApplyMilestoneAdminAction } from "./milestone-workflow"

describe("milestone admin workflow", () => {
  it("allows proof review to request disbursement", () => {
    expect(canApplyMilestoneAdminAction("PROOF_SUBMITTED", "APPROVE")).toBe(true)
    expect(canApplyMilestoneAdminAction("AI_VERIFIED", "APPROVE")).toBe(true)
  })

  it("only allows marking an approved payout as disbursed", () => {
    expect(canApplyMilestoneAdminAction("ADMIN_APPROVED", "DISBURSE")).toBe(true)
    expect(canApplyMilestoneAdminAction("AI_VERIFIED", "DISBURSE")).toBe(false)
  })

  it("does not allow actions on pending or already completed proofs", () => {
    expect(canApplyMilestoneAdminAction("PENDING", "APPROVE")).toBe(false)
    expect(canApplyMilestoneAdminAction("DISBURSED", "REJECT")).toBe(false)
  })
})
