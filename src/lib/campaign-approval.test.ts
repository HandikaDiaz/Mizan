import { describe, expect, it } from "vitest"
import { getCampaignApprovalResult } from "./campaign-approval"

describe("campaign approval result", () => {
  it("keeps approval successful when on-chain registration is unavailable", () => {
    expect(
      getCampaignApprovalResult(new Error("MIZAN_CONTRACT_ADDRESS belum dikonfigurasi")),
    ).toEqual({
      success: true,
      message:
        "Campaign disetujui, tetapi belum terdaftar ke smart contract. Periksa konfigurasi chain.",
    })
  })
})
