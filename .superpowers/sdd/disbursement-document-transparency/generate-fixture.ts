import { mkdir, writeFile } from "node:fs/promises"
import { generateDisbursementDocx } from "../../../src/lib/disbursement-document"

const output = "C:/Users/HP/.codex/visualizations/2026/09/23/01a0cd48-07c7-7c33-8ba7-9e830d7e8b2e/disbursement-fixture.docx"
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
await mkdir("C:/Users/HP/.codex/visualizations/2026/09/23/01a0cd48-07c7-7c33-8ba7-9e830d7e8b2e", { recursive: true })
await writeFile(output, bytes)
console.log(output)
