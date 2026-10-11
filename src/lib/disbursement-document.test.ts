import { describe, expect, it } from "vitest"

import { generateDisbursementDocx } from "./disbursement-document"

describe("disbursement document generator", () => {
  it("generates an editable DOCX containing request details and item totals", async () => {
    const bytes = await generateDisbursementDocx({
      organizationName: "Yayasan Mizan",
      registrationNumber: "REG-123",
      campaignTitle: "Bantuan Pangan",
      milestoneDescription: "Distribusi tahap pertama",
      walletAddress: "0x0000000000000000000000000000000000000001",
      requestedAmountWei: "1500000000000000000",
      currency: "BNB",
      description: "Pembelian paket sembako untuk penerima manfaat.",
      region: "Bandung",
      requesterName: "Owner Mizan",
      requestDate: "2026-09-24",
      items: [
        { name: "Beras", quantity: 2, unit: "karung", unitPriceWei: "500000000000000000" },
        { name: "Minyak", quantity: 1, unit: "botol", unitPriceWei: "500000000000000000" },
      ],
    })

    expect(bytes.byteLength).toBeGreaterThan(500)
    const documentXml = new TextDecoder().decode(bytes)

    expect(documentXml).toContain("Yayasan Mizan")
    expect(documentXml).toContain("Distribusi tahap pertama")
    expect(documentXml).toContain("Beras")
    expect(documentXml).toContain("1.5 BNB")
  })

  it("creates only one detail row per submitted item", async () => {
    const bytes = await generateDisbursementDocx({
      organizationName: "Yayasan Mizan",
      campaignTitle: "Bantuan Pangan",
      milestoneDescription: "Distribusi tahap pertama",
      walletAddress: "0x0000000000000000000000000000000000000001",
      requestedAmountWei: "1500000000000000000",
      currency: "BNB",
      description: "Pembelian paket sembako.",
      region: "Bandung",
      requesterName: "Owner Mizan",
      requestDate: "2026-09-24",
      items: [
        { name: "Beras", quantity: 2, unit: "karung", unitPriceWei: "500000000000000000" },
        { name: "Minyak", quantity: 1, unit: "botol", unitPriceWei: "500000000000000000" },
      ],
    })

    const documentXml = new TextDecoder().decode(bytes)
    const detailStart = documentXml.indexOf("Rincian penggunaan dana")
    const detailEnd = documentXml.indexOf("Total rincian harus", detailStart)
    const detailSection = documentXml.slice(detailStart, detailEnd)

    expect(detailSection.match(/<w:tr>/g)).toHaveLength(4)
  })
})
