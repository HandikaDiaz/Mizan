import { describe, expect, it } from "vitest"
import {
  isMilestoneReadyForDisbursement,
  isMilestoneVisibleOnDisbursementPage,
} from "./disbursement-presentation"

describe("disbursement milestone presentation", () => {
  it("shows a locked pending milestone for proof verification", () => {
    expect(isMilestoneVisibleOnDisbursementPage("PENDING", true)).toBe(true)
    expect(isMilestoneReadyForDisbursement("PENDING")).toBe(false)
  })
})
