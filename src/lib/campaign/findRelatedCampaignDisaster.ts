import { db } from "@/src/prisma/db"
import {
  buildCampaignText,
} from "./extractCampaign"
import { RelatedDisasterEvent } from "../type/disasterType"
import { guessDisasterType } from "./campaignDisasterType"

export async function findRelatedCamapignDisasterEvents(
  campaignText: string
): Promise<RelatedDisasterEvent[]> {
  const disasterType = guessDisasterType(campaignText)

  console.log(
    `[debug] disasterType: ${disasterType ?? "TIDAK TERDETEKSI"}`
  )

  if (!disasterType) {
    console.log(
      `[debug] disasterType tidak ditemukan untuk teks: "${campaignText}"`
    )

    return []
  }

  const events = await db.orm.public.DisasterEvent.where((de) =>
    de.validationStatus.in([
      "OFFICIAL_CONFIRMED",
      "CORROBORATED",
    ])
  )
    .orderBy((de) => de.firstDetectedAt.desc())
    .limit(100)
    .all()

  const filtered = events.filter(
    (event) => event.disasterType === disasterType
  )

  console.log(
    `[debug] disasterType=${disasterType}, kandidat event=${filtered.length}`
  )

  return filtered.map((event) => ({
    id: event.id,
    title: event.title,
    disasterType: event.disasterType,
    locationName: event.locationName,
    province: event.province,
    city: event.city,
    severityLevel: event.severityLevel,
    validationStatus: event.validationStatus,
  }))
}
export async function markCaptureChecked(captureId: string) {
  await db.orm.public.RawCapture.where({ id: captureId }).update({
    campaignCheckedAt: new Date().toISOString(),
  })
}