import { describe, expect, it } from "vitest"

import {
  getActiveRequestKey,
  validateMilestoneAmounts,
  validateRequestAmount,
  validateRequestItems,
} from "./disbursement-validation"

describe("disbursement amount invariants", () => {
  it("requires milestone totals to exactly equal the campaign target", () => {
    expect(
      validateMilestoneAmounts([{ amountWei: "40" }, { amountWei: "60" }], "100"),
    ).toMatchObject({ valid: true, totalWei: "100" })
    expect(validateMilestoneAmounts([{ amountWei: "99" }], "100").valid).toBe(false)
    expect(validateMilestoneAmounts([{ amountWei: "101" }], "100").valid).toBe(false)
  })

  it("requires the request and item total to equal the milestone amount", () => {
    const items = [{ name: "Beras", quantity: 2, unit: "karung", unitPriceWei: "50" }]
    expect(validateRequestAmount("100", "100")).toBe(true)
    expect(validateRequestAmount("100", "99")).toBe(false)
    expect(validateRequestItems(items, "100")).toBe(true)
    expect(validateRequestItems(items, "99")).toBe(false)
  })

  it("generates one stable uniqueness slot per milestone", () => {
    expect(getActiveRequestKey(42)).toBe("milestone:42")
    expect(() => getActiveRequestKey(0)).toThrow("Milestone ID tidak valid")
  })
})
