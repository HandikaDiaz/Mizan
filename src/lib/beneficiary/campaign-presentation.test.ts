import { describe, expect, it } from "vitest"

import { formatCampaignCategory } from "./campaign-presentation"

describe("formatCampaignCategory", () => {
  it("turns stored category enum values into user-facing labels", () => {
    expect(formatCampaignCategory("DONASI_UMUM")).toBe("Donasi Umum")
    expect(formatCampaignCategory("BENCANA")).toBe("Tanggap Bencana")
  })

  it("keeps an already formatted category readable", () => {
    expect(formatCampaignCategory("Wakaf")).toBe("Wakaf")
  })
})
