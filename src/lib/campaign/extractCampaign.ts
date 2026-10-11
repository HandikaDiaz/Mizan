import { AyobantuResult } from "../type/AyobantuType"
import { DisasterType } from "../type/disasterType"

export interface CampaignExtraction {
  title: string
  description: string | null
  location: string | null
  category: string | null
  collectedAmount: number
  targetAmount: number | null
  campaigner: string | null
  daysLeftText: number
  image: string
  summary: string
}

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
}

export function extractCampaignFields(
  item: AyobantuResult
): CampaignExtraction {
  return {
    title: item.title?.trim() ?? "",
    description: null,
    location: item.location?.trim() || null,
    category: item.category?.trim() || null,
    collectedAmount: item.collectedAmount ?? 0,
    targetAmount: item.targetAmount ?? null,
    campaigner: item.campaigner?.trim() || null,
    daysLeftText: Number(item.daysLeftText?.match(/\d+/)?.[0] ?? 0),
    image: item.image || "",
    summary: item.summary || "",
  }
}

export function buildCampaignText(extraction: CampaignExtraction): string {
  return [
    extraction.title,
    extraction.description,
    extraction.category,
    extraction.location,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim()
}
