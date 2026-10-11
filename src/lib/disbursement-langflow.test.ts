import { afterEach, describe, expect, it, vi } from "vitest"

import { analyzeDisbursementWithLangflow } from "./disbursement-langflow"

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

describe("disbursement Langflow analyzer", () => {
  it("uploads the document and parses an APPROVE response", async () => {
    process.env.LANGFLOW_BASE_URL = "https://langflow.example"
    process.env.LANGFLOW_API_KEY = "test-key"
    process.env.LANGFLOW_DISBURSEMENT_FLOW_ID = "flow-123"
    process.env.LANGFLOW_DISBURSEMENT_FILE_COMPONENT_ID = "File-abc"

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ file_path: "request.docx" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        outputs: [{ outputs: [{ results: { message: { text: JSON.stringify({ decision: "APPROVE", confidence: 0.94, issues: [], summary: "Lengkap", recommendation: "Lanjut" }) } } }] }],
      }), { status: 200 }))

    const result = await analyzeDisbursementWithLangflow({
      file: new File(["document"], "request.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
      metadata: { requestedAmountWei: "100", description: "Pembelian" },
    })

    expect(result.decision).toBe("APPROVE")
    expect(result.confidence).toBe(0.94)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("returns REVIEW when Langflow returns malformed output", async () => {
    process.env.LANGFLOW_BASE_URL = "https://langflow.example"
    process.env.LANGFLOW_API_KEY = "test-key"
    process.env.LANGFLOW_DISBURSEMENT_FLOW_ID = "flow-123"

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ path: "request.pdf" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ outputs: [] }), { status: 200 }))

    const result = await analyzeDisbursementWithLangflow({
      file: new File(["document"], "request.pdf", { type: "application/pdf" }),
      metadata: { requestedAmountWei: "100" },
    })

    expect(result.decision).toBe("REVIEW")
    expect(result.issues.length).toBeGreaterThan(0)
  })
})
