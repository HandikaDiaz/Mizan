export type DisbursementLangflowResult = {
  decision: "APPROVE" | "REVIEW" | "REJECT"
  confidence: number
  issues: string[]
  summary: string
  recommendation: string
  rawOutput?: unknown
}

type AnalyzeInput = {
  file: File
  metadata: Record<string, unknown>
}

const reviewResult = (issue: string): DisbursementLangflowResult => ({
  decision: "REVIEW",
  confidence: 0,
  issues: [issue],
  summary: "Pengajuan membutuhkan pemeriksaan manual.",
  recommendation: "Periksa dokumen dan rincian pengajuan di dashboard admin.",
})

const getOutputText = (data: unknown): string => {
  if (!data || typeof data !== "object") return ""
  const root = data as Record<string, unknown>
  const outputs = root.outputs
  if (!Array.isArray(outputs)) return ""
  const first = outputs[0]
  if (!first || typeof first !== "object") return ""
  const nested = (first as Record<string, unknown>).outputs
  if (!Array.isArray(nested)) return ""
  const result = nested[0]
  if (!result || typeof result !== "object") return ""
  const results = (result as Record<string, unknown>).results
  if (!results || typeof results !== "object") return ""
  const message = (results as Record<string, unknown>).message
  if (message && typeof message === "object") {
    const text = (message as Record<string, unknown>).text
    if (typeof text === "string") return text
  }
  return ""
}

const getFilePath = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>
  const direct = [record.file_path, record.path].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  )
  if (direct) return direct
  const nested = record.file
  if (nested && typeof nested === "object") {
    return [(nested as Record<string, unknown>).file_path, (nested as Record<string, unknown>).path]
      .find((value): value is string => typeof value === "string" && value.length > 0) ?? null
  }
  return null
}

const parseResult = (text: string): DisbursementLangflowResult => {
  if (!text) return reviewResult("Langflow tidak mengembalikan hasil analisis.")
  try {
    const match = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? text.match(/(\{[\s\S]*\})/)
    const parsed: unknown = JSON.parse(match?.[1] ?? text)
    if (!parsed || typeof parsed !== "object") return reviewResult("Output Langflow bukan JSON object.")
    const value = parsed as Record<string, unknown>
    const decision = value.decision
    if (decision !== "APPROVE" && decision !== "REVIEW" && decision !== "REJECT") {
      return reviewResult("Keputusan Langflow tidak valid.")
    }
    const issues = Array.isArray(value.issues)
      ? value.issues.filter((issue): issue is string => typeof issue === "string")
      : []
    return {
      decision,
      confidence: typeof value.confidence === "number" ? Math.max(0, Math.min(1, value.confidence)) : 0,
      issues,
      summary: typeof value.summary === "string" ? value.summary : "",
      recommendation: typeof value.recommendation === "string" ? value.recommendation : "",
      rawOutput: parsed,
    }
  } catch {
    return reviewResult("Output Langflow tidak dapat dibaca sebagai JSON.")
  }
}

export async function analyzeDisbursementWithLangflow(input: AnalyzeInput): Promise<DisbursementLangflowResult> {
  const baseUrl = process.env.LANGFLOW_BASE_URL
  const apiKey = process.env.LANGFLOW_API_KEY
  const flowId = process.env.LANGFLOW_DISBURSEMENT_FLOW_ID ?? process.env.LANGFLOW_MILESTONE_VERIFICATION_FLOW_ID
  if (!baseUrl || !apiKey || !flowId) return reviewResult("Konfigurasi Langflow belum lengkap.")

  try {
    const uploadBody = new FormData()
    uploadBody.append("file", new Blob([await input.file.arrayBuffer()], { type: input.file.type }), input.file.name)
    const uploadResponse = await fetch(`${baseUrl}/api/v1/files/upload/${flowId}`, {
      method: "POST",
      headers: { Accept: "application/json", "x-api-key": apiKey },
      body: uploadBody,
    })
    if (!uploadResponse.ok) return reviewResult(`Upload dokumen ke Langflow gagal (${uploadResponse.status}).`)
    const filePath = getFilePath(await uploadResponse.json())
    if (!filePath) return reviewResult("Langflow tidak mengembalikan path dokumen.")

    const componentId = process.env.LANGFLOW_DISBURSEMENT_FILE_COMPONENT_ID ?? "File"
    const runResponse = await fetch(`${baseUrl}/api/v1/run/${flowId}?stream=false`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        input_value: JSON.stringify({ ...input.metadata, filePath }),
        input_type: "text",
        output_type: "text",
        tweaks: { [componentId]: { path: filePath } },
      }),
    })
    if (!runResponse.ok) return reviewResult(`Analisis Langflow gagal (${runResponse.status}).`)
    return parseResult(getOutputText(await runResponse.json()))
  } catch (error) {
    console.error("Disbursement Langflow error:", error)
    return reviewResult("Gagal menghubungi layanan analisis Langflow.")
  }
}
