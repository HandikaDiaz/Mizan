import { RelatedDisasterEvent } from "./disasterType"

export interface AyobantuType {
  slug: string
  category?: string
  campaignType: string
  collectedAmount: number
  targetAmount: number | null
  daysLeftText?: string
  campaignerUrl?: string
}

export interface AyobantuResult {
  sourceId: string
  slug: string
  title: string
  summary: string
  url: string
  image?: string
  category?: string
  location?: string
  campaignType: string // "normal" | "qurban"
  collectedAmount: number // dalam Rupiah, contoh 10000000
  targetAmount: number | null // null = tidak terbatas / unlimited
  campaigner?: string
  campaignerUrl?: string
  verified: boolean
  daysLeftText?: string // contoh: "10 hari lagi"
}

export interface AyobantuStructuredData {
  slug: string
  category?: string
  campaignType: string
  collectedAmount: number
  targetAmount: number | null // null = tidak terbatas
  daysLeftText?: number
  campaignerUrl?: string
}

export interface AyobantuCampaignPromptInput {
  title: string
  url: string | null
  authorName: string | null
  structured: {
    category?: string
    collectedAmount: number
    targetAmount: number | null
    daysLeftText?: number
  }
  relatedEvents: RelatedDisasterEvent[]
}
