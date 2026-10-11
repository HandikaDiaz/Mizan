import { describe, expect, it } from "vitest"

import {
  toPublicDisbursementHistoryItem,
  type DisbursedMilestone,
} from "./disbursement-history"

const milestone: DisbursedMilestone = {
  id: 42,
  order: 2,
  description: "Distribusi paket pangan",
  amountWei: "1250000000000000000",
  proofImageUrl: "proofs/milestone-42.jpg",
  proofNote: "Seluruh paket diterima oleh warga.",
  disbursementTxHash: "0xabc123",
  disbursementRequestedAt: "2026-09-28T10:00:00.000Z",
  updatedAt: "2026-09-28T11:00:00.000Z",
}

describe("toPublicDisbursementHistoryItem", () => {
  it("maps a disbursed milestone to the public usage history shape", () => {
    expect(
      toPublicDisbursementHistoryItem(
        milestone,
        "BNB",
        "https://example.com/proof.jpg"
      )
    ).toEqual({
      id: "42",
      milestone: "Distribusi paket pangan",
      milestoneOrder: 2,
      amountWei: "1250000000000000000",
      currency: "BNB",
      description: "Seluruh paket diterima oleh warga.",
      region: "Indonesia",
      proofUrl: "https://example.com/proof.jpg",
      transactionHash: "0xabc123",
      createdAt: "2026-09-28T11:00:00.000Z",
    })
  })

  it("uses the milestone request date when updatedAt is unavailable", () => {
    const withoutUpdatedAt = { ...milestone, updatedAt: null }

    expect(
      toPublicDisbursementHistoryItem(withoutUpdatedAt, "USDT", null).createdAt
    ).toBe("2026-09-28T10:00:00.000Z")
  })
})
