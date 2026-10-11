import { describe, expect, it } from "vitest"
import { decimalBnbToWei } from "./validation"

describe("payment amount validation", () => {
  it("mengubah nominal BNB ke wei tanpa Float dan menolak input invalid", () => {
    expect(decimalBnbToWei("0.01")).toBe("10000000000000000")
    expect(decimalBnbToWei("1.000000000000000001")).toBe("1000000000000000001")
    expect(decimalBnbToWei("0.0000000000000000001")).toBeNull()
    expect(decimalBnbToWei("-1")).toBeNull()
  })
})
