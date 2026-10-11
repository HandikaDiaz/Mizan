import { describe, expect, it } from "vitest"
import { transitionCampaignReviewStatus } from "./campaign-workflow"

describe("campaign review workflow", () => {
  it("allows an AI draft to be approved directly by an admin", () => {
    expect(transitionCampaignReviewStatus("AI_DRAFT", "APPROVED")).toBe(
      "APPROVED"
    )
  })
})
