import { DisasterType } from "../type/disasterType"

export const DISASTER_CAMPAIGN_TYPE_KEYWORDS: Record<string, DisasterType> = {
  "kebakaran hutan dan lahan": "KARHUTLA",
  "kebakaran hutan": "KARHUTLA",
  karhutla: "KARHUTLA",

  banjir: "BANJIR",
  gempa: "GEMPA_BUMI",
  longsor: "TANAH_LONGSOR",
  tsunami: "TSUNAMI",

  "gunung meletus": "ERUPSI_GUNUNG_API",
  erupsi: "ERUPSI_GUNUNG_API",
  meletus: "ERUPSI_GUNUNG_API",

  kekeringan: "KEKERINGAN",
  "puting beliung": "ANGIN_PUTING_BELIUNG",
}

export function guessDisasterType(text: string): DisasterType | null {
  if (!text?.trim()) {
    return null
  }

  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim()

  const keywords = Object.entries(DISASTER_CAMPAIGN_TYPE_KEYWORDS).sort(
    ([a], [b]) => b.length - a.length
  )

  for (const [keyword, disasterType] of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      return disasterType
    }
  }

  return null
}