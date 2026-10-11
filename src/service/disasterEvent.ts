import { db } from "../prisma/db"
import { DisasterType } from "./analysisServices"

export interface CreateDisasterEventInput {
  disasterType?: DisasterType
  title: string
  description?: string
  validationStatus?: ValidationStatus
  locationName?: string
  province?: string
  city?: string
  officialConfirmed?: boolean
}

export type ValidationStatus =
  "UNVERIFIED" | "CORROBORATED" | "OFFICIAL_CONFIRMED" | "REJECTED"

export async function createDisasterEvent(data: CreateDisasterEventInput) {
  return db.orm.public.DisasterEvent.create({
    title: data.title,
    description: data.description,
    validationStatus: data.validationStatus,
    locationName: data.locationName,
    province: data.province,
    city: data.city,
    officialConfirmed: data.officialConfirmed,
    disasterType: data.disasterType,
  })
}

export type SeverityLevel = "RENDAH" | "SEDANG" | "TINGGI" | "KRITIS"
