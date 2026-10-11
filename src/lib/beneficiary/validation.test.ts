import { describe, expect, it } from "vitest"
import { campaignInputSchema } from "./validation"

describe("campaignInputSchema", () => {
  const validInput = {
    title: "Bantuan Air Bersih",
    category: "BENCANA",
    description: "Distribusi air bersih untuk warga terdampak.",
    targetAmountWei: "1000000000000000000",
    recipientWallet: "0x1234567890123456789012345678901234567890",
    currency: "BNB",
    daysLeft: 30,
    milestones: [
      { description: "Pengadaan tangki air", amountWei: "500000000000000000" },
      { description: "Distribusi ke warga", amountWei: "500000000000000000" },
    ],
  }

  it("accepts a valid campaign with milestones", () => {
    expect(campaignInputSchema.parse(validInput)).toEqual(validInput)
  })

  it("rejects a campaign without milestones", () => {
    expect(() => campaignInputSchema.parse({ ...validInput, milestones: [] })).toThrow()
  })

  it("rejects milestones whose total does not equal the target", () => {
    expect(() =>
      campaignInputSchema.parse({
        ...validInput,
        milestones: [
          {
            description: "Terlalu besar",
            amountWei: "1000000000000000001",
          },
        ],
      }),
    ).toThrow("Total milestone harus sama dengan target dana")
  })
})
