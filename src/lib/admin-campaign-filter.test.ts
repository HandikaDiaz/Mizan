import { describe, expect, it } from "vitest"
import { filterAdminCampaigns } from "./admin-campaign-filter"

const campaigns = [
  {
    id: "1",
    title: "Bantuan banjir",
    organizerName: "Admin Mizan",
    source: "AI_MOCK" as const,
    aiReference: "BNPB",
  },
  {
    id: "2",
    title: "Beasiswa anak",
    organizerName: "Yayasan Harapan",
    source: "MANUAL" as const,
    aiReference: null,
  },
]

describe("admin campaign filter", () => {
  it("filters AI campaigns by source and search text", () => {
    expect(
      filterAdminCampaigns(campaigns, { source: "AI_MOCK", query: "bnpb" })
    ).toEqual([campaigns[0]])
    expect(
      filterAdminCampaigns(campaigns, { source: "MANUAL", query: "bantuan" })
    ).toEqual([])
  })
})
