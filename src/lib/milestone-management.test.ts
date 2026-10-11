import { describe, expect, it } from "vitest"

import {
  canEditMilestone,
  canSubmitMilestoneProof,
  canGenerateMilestoneTemplate,
  canRequestMilestoneDisbursement,
} from "./milestone-management"

describe("beneficiary milestone management", () => {
  it("allows editing and deleting an unlocked milestone", () => {
    expect(canEditMilestone({ lockedAt: null })).toBe(true)
  })

  it("blocks editing and deleting after a milestone is locked", () => {
    expect(canEditMilestone({ lockedAt: "2026-10-06T00:00:00.000Z" })).toBe(false)
  })

  it("requires a locked AI-verified milestone before disbursement", () => {
    expect(
      canRequestMilestoneDisbursement({ lockedAt: null, status: "AI_VERIFIED" }),
    ).toBe(false)
    expect(
      canRequestMilestoneDisbursement({
        lockedAt: "2026-10-06T00:00:00.000Z",
        status: "PROOF_SUBMITTED",
      }),
    ).toBe(false)
    expect(
      canRequestMilestoneDisbursement({
        lockedAt: "2026-10-06T00:00:00.000Z",
        status: "AI_VERIFIED",
      }),
    ).toBe(true)
  })

  it("allows the combined proof form only for a newly locked pending milestone", () => {
    expect(canSubmitMilestoneProof({ lockedAt: null, status: "PENDING" })).toBe(false)
    expect(canSubmitMilestoneProof({ lockedAt: "2026-10-06T00:00:00.000Z", status: "PENDING" })).toBe(true)
    expect(canSubmitMilestoneProof({ lockedAt: "2026-10-06T00:00:00.000Z", status: "REJECTED" })).toBe(false)
    expect(canSubmitMilestoneProof({ lockedAt: "2026-10-06T00:00:00.000Z", status: "AI_VERIFIED" })).toBe(false)
    expect(canGenerateMilestoneTemplate({ lockedAt: "2026-10-06T00:00:00.000Z", status: "PENDING" })).toBe(true)
    expect(canGenerateMilestoneTemplate({ lockedAt: "2026-10-06T00:00:00.000Z", status: "AI_VERIFIED" })).toBe(false)
  })
})
