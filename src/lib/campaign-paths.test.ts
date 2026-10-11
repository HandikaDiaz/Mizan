import { describe, expect, it } from "vitest"
import { getCampaignRevalidationPaths } from "./campaign-paths"

describe("campaign revalidation paths", () => {
  it("refreshes beneficiary and admin campaign views after a campaign change", () => {
    expect(getCampaignRevalidationPaths()).toEqual([
      "/beneficiary/campaigns",
      "/admin/campaigns",
      "/admin",
    ])
  })
})
