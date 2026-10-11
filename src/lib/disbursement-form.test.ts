import { describe, expect, it } from "vitest"

import {
  buildDisbursementItems,
  buildDisbursementFormPayload,
  calculateDisbursementTotalWei,
  type DisbursementItemDraft,
} from "./disbursement-form"

const drafts: DisbursementItemDraft[] = [
  { name: "Beras", quantity: "2", unit: "karung", unitPrice: "0.5" },
  { name: "Minyak", quantity: "1", unit: "botol", unitPrice: "0.25" },
]

describe("disbursement form items", () => {
  it("builds one request payload containing every item", () => {
    expect(
      buildDisbursementFormPayload({
        milestoneId: 42,
        purpose: "Distribusi paket pangan",
        items: drafts,
      }),
    ).toEqual({
      milestoneId: 42,
      requestedAmountWei: "1250000000000000000",
      description: "Distribusi paket pangan",
      region: "Indonesia",
      items: [
        {
          name: "Beras",
          quantity: 2,
          unit: "karung",
          unitPriceWei: "500000000000000000",
        },
        {
          name: "Minyak",
          quantity: 1,
          unit: "botol",
          unitPriceWei: "250000000000000000",
        },
      ],
    })
  })

  it("converts every filled item into the disbursement payload", () => {
    expect(buildDisbursementItems(drafts)).toEqual([
      {
        name: "Beras",
        quantity: 2,
        unit: "karung",
        unitPriceWei: "500000000000000000",
      },
      {
        name: "Minyak",
        quantity: 1,
        unit: "botol",
        unitPriceWei: "250000000000000000",
      },
    ])
  })

  it("calculates the requested amount from all item subtotals", () => {
    const items = buildDisbursementItems(drafts)

    expect(calculateDisbursementTotalWei(items)).toBe("1250000000000000000")
  })

  it("rejects an empty item list", () => {
    expect(() => buildDisbursementItems([])).toThrow(
      "Tambahkan setidaknya satu item penggunaan dana.",
    )
  })
})
