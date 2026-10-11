import { describe, expect, it } from "vitest"

import { resolveMilestoneVerificationStatus } from "./milestone-verification"

describe("resolveMilestoneVerificationStatus", () => {
  it("marks a sufficiently confident positive result as AI_VERIFIED", () => {
    expect(resolveMilestoneVerificationStatus({ verified: true, confidence: 0.8 })).toBe("AI_VERIFIED")
  })

  it("keeps failed or uncertain verification available for manual review", () => {
    expect(resolveMilestoneVerificationStatus({ verified: false, confidence: 0 })).toBe("MANUAL_REVIEW")
    expect(resolveMilestoneVerificationStatus({ verified: false, confidence: 0.4 })).toBe("MANUAL_REVIEW")
    expect(resolveMilestoneVerificationStatus({ verified: true, confidence: 0.4 })).toBe("MANUAL_REVIEW")
  })
})
