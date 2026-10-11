import { describe, expect, it } from "vitest"

import {
  buildMilestoneVerificationPayload,
  buildMilestonePdfRunPayload,
} from "./langflow-payload"

describe("buildMilestoneVerificationPayload", () => {
  it("encodes the uploaded image and includes the proof note", async () => {
    const file = new File(["proof-image"], "proof.jpg", { type: "image/jpeg" })

    const payload = await buildMilestoneVerificationPayload({
      file,
      proofImageUrl: "https://storage.example/proof.jpg",
      proofNote: "Dana disalurkan untuk kebutuhan pangan.",
      milestoneDescription: "Pembelian bahan pangan",
      campaignTitle: "Bantuan warga terdampak banjir",
    })

    expect(payload.input_value).toBe(
      JSON.stringify({
        proof_image_url: "https://storage.example/proof.jpg",
        proof_note: "Dana disalurkan untuk kebutuhan pangan.",
        milestone_description: "Pembelian bahan pangan",
        campaign_title: "Bantuan warga terdampak banjir",
      }),
    )
    expect(payload.files).toEqual(["data:image/jpeg;base64,cHJvb2YtaW1hZ2U="])
    expect(payload.input_type).toBe("chat")
    expect(payload.output_type).toBe("chat")
  })

  it("encodes a PDF with the same verification metadata", async () => {
    const file = new File(["proof-pdf"], "proof.pdf", { type: "application/pdf" })

    const payload = await buildMilestoneVerificationPayload({
      file,
      proofImageUrl: "https://storage.example/proof.pdf",
      proofNote: "Dana dibelanjakan untuk kebutuhan pangan.",
      milestoneDescription: "Belanja kebutuhan pangan",
      campaignTitle: "Bantuan Panti Asuhan",
    })

    expect(payload.files).toEqual(["data:application/pdf;base64,cHJvb2YtcGRm"])
    expect(JSON.parse(payload.input_value)).toMatchObject({
      proof_note: "Dana dibelanjakan untuk kebutuhan pangan.",
    })
  })

  it("points the PDF run payload to the configured Read File component", () => {
    const payload = buildMilestonePdfRunPayload({
      filePath: "7c978210-0e95-47e7-8c8c-37b2e4380e8f/proof.pdf",
      componentId: "File-p8DvZ",
      proofImageUrl: "https://storage.example/proof.pdf",
      proofNote: "Dana dibelanjakan untuk kebutuhan pangan.",
      milestoneDescription: "Belanja kebutuhan pangan",
      campaignTitle: "Bantuan Panti Asuhan",
    })

    expect(payload.tweaks).toEqual({
      "File-p8DvZ": {
        path: ["7c978210-0e95-47e7-8c8c-37b2e4380e8f/proof.pdf"],
      },
    })
    expect(JSON.parse(payload.input_value)).toMatchObject({
      proof_note: "Dana dibelanjakan untuk kebutuhan pangan.",
    })
  })
})
