import { describe, expect, it } from "vitest"

import { decimalBnbToWei } from "./payments/validation"

describe("decimal BNB input", () => {
  it("accepts a comma as the decimal separator", () => {
    expect(decimalBnbToWei("0,1")).toBe("100000000000000000")
  })
})
