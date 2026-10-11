import { db } from "../prisma/db"

export interface CreateAnalysisInput {
  rawCaptureId: string
  isDisaster: boolean
  disasterType?: DisasterType
  confidenceScore: number
  extractedLocation?: {
    locationName?: string
    province?: string
  }
}

export type DisasterType =
  | "GEMPA_BUMI"
  | "BANJIR"
  | "TANAH_LONGSOR"
  | "KARHUTLA"
  | "TSUNAMI"
  | "ERUPSI_GUNUNG_API"
  | "KEKERINGAN"
  | "LAINNYA"

export async function saveAnalysis(data: CreateAnalysisInput) {
  return db.orm.public.Analysis.create({
    rawCaptureId: data.rawCaptureId,
    isDisaster: data.isDisaster,
    disasterType: data.disasterType,
    confidenceScore: data.confidenceScore,
    
    extractedLocation: data.extractedLocation,
  })
}
