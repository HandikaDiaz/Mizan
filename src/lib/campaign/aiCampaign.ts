import { callWithFallback } from "@/src/agents/callWithFallBackModel"
import { buildCampaignPrompt } from "../prompt/ayoBantuPrompt"
import { RelatedDisasterEvent } from "../type/disasterType"
import { CampaignExtraction } from "./extractCampaign"

export async function aiCampaign(input: {
  extraction: CampaignExtraction
  url: string | null
  relatedEvents: RelatedDisasterEvent[]
}): Promise<unknown | null> {
  const prompt = buildCampaignPrompt({
    title: input.extraction.title,
    url: input.url,
    authorName: input.extraction.campaigner,
    structured: {
      category: input.extraction.category ?? undefined,
      collectedAmount: input.extraction.collectedAmount,
      targetAmount: input.extraction.targetAmount,
      daysLeftText: input.extraction.daysLeftText ?? 0,
    },
    relatedEvents: input.relatedEvents,
  })

  const messageContent = await callWithFallback(prompt)

  if (!messageContent) {
    console.error("[aiCampaign] semua model gagal / message content kosong")
    return null
  }

  const cleaned = messageContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    console.warn(
      "[aiCampaign] response bukan JSON murni, mencoba extract JSON..."
    )
  }

  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    console.error(
      "[aiCampaign] JSON object tidak ditemukan:",
      cleaned.slice(0, 500)
    )

    return null
  }

  const jsonText = cleaned.slice(start, end + 1)

  try {
    return JSON.parse(jsonText)
  } catch {
    console.error(
      "[aiCampaign] JSON ditemukan tetapi invalid:",
      jsonText.slice(0, 500)
    )

    return null
  }
}
