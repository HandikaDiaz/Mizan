import "server-only"

import {
  buildMilestonePdfRunPayload,
  buildMilestoneVerificationPayload,
  type MilestoneVerificationPayloadInput,
} from "./langflow-payload"

export type LangflowVerificationResult = {
  verified: boolean
  confidence: number
  reasoning: string
}

/**
 * Call the Langflow milestone-verification flow to assess a proof submission.
 *
 * Sends the proof file, note, milestone description, and campaign title to
 * the AI flow. Images use the inline file format; PDFs use Langflow's file
 * management endpoint and the flow's Read File component.
 */
export async function verifyMilestoneProof(input: {
  file: File
  proofImageUrl: string
  proofNote: string
  milestoneDescription: string
  campaignTitle: string
}): Promise<LangflowVerificationResult> {
  const baseUrl = process.env.LANGFLOW_BASE_URL
  const apiKey = process.env.LANGFLOW_API_KEY
  const flowId = process.env.LANGFLOW_MILESTONE_VERIFICATION_FLOW_ID

  if (!baseUrl || !apiKey || !flowId) {
    console.error("Missing Langflow env vars")
    return { verified: false, confidence: 0, reasoning: "Konfigurasi Langflow belum lengkap." }
  }

  const payloadInput: MilestoneVerificationPayloadInput = input

  try {
    const isDocument = input.file.type === "application/pdf" || input.file.type === "application/msword" || input.file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    const body = isDocument
      ? await buildPdfVerificationRequest(input, baseUrl, apiKey, flowId)
      : await buildMilestoneVerificationPayload(payloadInput)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(`${baseUrl}/api/v1/run/${flowId}?stream=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error(`Langflow API error ${response.status}:`, text)
      return { verified: false, confidence: 0, reasoning: `Langflow error: ${response.status}` }
    }

    const data = await response.json()

    // Langflow response structure: outputs[0].outputs[0].results.message.text
    const messageText =
      data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ??
      data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ??
      ""

    return parseLangflowResponse(messageText)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Langflow API timeout (30s)")
      return { verified: false, confidence: 0, reasoning: "Verifikasi AI timeout — coba lagi nanti." }
    }
    console.error("Langflow API error:", error)
    return { verified: false, confidence: 0, reasoning: "Gagal menghubungi layanan verifikasi AI." }
  }
}

async function buildPdfVerificationRequest(
  input: MilestoneVerificationPayloadInput,
  baseUrl: string,
  apiKey: string,
  flowId: string,
) {
  const filePath = await uploadPdfToLangflow(input.file, baseUrl, apiKey, flowId)
  const componentId = process.env.LANGFLOW_PDF_FILE_COMPONENT_ID ?? "File-p8DvZ"

  return buildMilestonePdfRunPayload({
    filePath,
    componentId,
    proofImageUrl: input.proofImageUrl,
    proofNote: input.proofNote,
    milestoneDescription: input.milestoneDescription,
    campaignTitle: input.campaignTitle,
  })
}

async function uploadPdfToLangflow(
  file: File,
  baseUrl: string,
  apiKey: string,
  flowId: string,
): Promise<string> {
  const formData = new FormData()
  const bytes = await file.arrayBuffer()
  formData.append("file", new Blob([bytes], { type: file.type }), file.name)

  const response = await fetch(`${baseUrl}/api/v1/files/upload/${flowId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    console.error(`Langflow file upload error ${response.status}:`, text)
    throw new Error(`Langflow file upload error: ${response.status}`)
  }

  const data: unknown = await response.json()
  const filePath = getLangflowFilePath(data)
  if (!filePath) {
    throw new Error("Langflow tidak mengembalikan path file PDF.")
  }

  return filePath
}

function getLangflowFilePath(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>
  const directPath = [record.file_path, record.path]
    .find((value): value is string => typeof value === "string" && value.length > 0)
  if (directPath) return directPath

  const nestedFile = record.file
  if (nestedFile && typeof nestedFile === "object") {
    const nestedRecord = nestedFile as Record<string, unknown>
    return [nestedRecord.file_path, nestedRecord.path]
      .find((value): value is string => typeof value === "string" && value.length > 0) ?? null
  }

  return null
}

/**
 * Parse the AI response text into a structured result.
 * Expects JSON with keys: verified (bool), confidence (0–1), reasoning (string).
 * Falls back to heuristics if the response isn't valid JSON.
 */
function parseLangflowResponse(text: string): LangflowVerificationResult {
  if (!text) {
    return { verified: false, confidence: 0, reasoning: "Tidak ada respons dari AI." }
  }

  // Try parsing as JSON first
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? text.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch?.[1] ?? text
    const parsed = JSON.parse(jsonStr)

    const verified = parsed.verified === true || parsed.verified === "true"
    const confidence = typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0
    const reasoning = typeof parsed.reasoning === "string"
      ? parsed.reasoning
      : String(parsed.reasoning ?? text)

    return { verified, confidence, reasoning }
  } catch {
    // Fallback: treat the raw text as reasoning, use heuristics
    const lower = text.toLowerCase()
    const hasPositive = lower.includes("verified") || lower.includes("valid") || lower.includes("approved") || lower.includes("terverifikasi")
    const hasNegative = lower.includes("rejected") || lower.includes("invalid") || lower.includes("ditolak")

    return {
      verified: hasPositive && !hasNegative,
      confidence: hasPositive && !hasNegative ? 0.7 : 0.3,
      reasoning: text.slice(0, 500),
    }
  }
}
