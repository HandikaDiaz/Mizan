import { describe, expect, it } from "vitest"

import { selectNewestCampaigns } from "./summary"

describe("selectNewestCampaigns", () => {
  it("returns at most three campaigns ordered from newest to oldest", () => {
    const campaigns = [
      { id: 1, createdAt: "2026-09-20T10:00:00.000Z" },
      { id: 2, createdAt: "2026-09-22T10:00:00.000Z" },
      { id: 3, createdAt: "2026-09-21T10:00:00.000Z" },
      { id: 4, createdAt: "2026-09-23T10:00:00.000Z" },
    ]

    expect(selectNewestCampaigns(campaigns)).toEqual([
      { id: 4, createdAt: "2026-09-23T10:00:00.000Z" },
      { id: 2, createdAt: "2026-09-22T10:00:00.000Z" },
      { id: 3, createdAt: "2026-09-21T10:00:00.000Z" },
    ])
  })

  it("does not mutate the source campaign list", () => {
    const campaigns = [
      { id: 1, createdAt: "2026-09-20T10:00:00.000Z" },
      { id: 2, createdAt: "2026-09-22T10:00:00.000Z" },
    ]

    selectNewestCampaigns(campaigns)

    expect(campaigns.map((campaign) => campaign.id)).toEqual([1, 2])
  })
})
