import { describe, expect, it } from "vitest"
import { transitionCampaignReviewStatus } from "../../../../../src/lib/campaign-workflow"

describe("campaign review workflow", () => {
  it("mengizinkan AI draft masuk ke review lalu approve atau reject", () => {
    expect(transitionCampaignReviewStatus("AI_DRAFT", "PENDING_REVIEW")).toBe(
      "PENDING_REVIEW",
    )
    expect(transitionCampaignReviewStatus("PENDING_REVIEW", "APPROVED")).toBe(
      "APPROVED",
    )
    expect(transitionCampaignReviewStatus("PENDING_REVIEW", "REJECTED")).toBe(
      "REJECTED",
    )
  })

  it("menolak publish sebelum approval", () => {
    expect(() =>
      transitionCampaignReviewStatus("PENDING_REVIEW", "PENDING_REVIEW"),
    ).toThrow()
  })
})
