import { openRouter } from "@/src/lib/openRouter"
import { db } from "@/src/prisma/db"
import { DisasterType, saveAnalysis } from "@/src/service/analysisServices"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { createScrapeJob } from "@/src/service/scrapeServices"
import { SeverityLevel, ValidationStatus } from "@/src/service/disasterEvent"
import { DISASTER_AGENT_PROMPT } from "@/src/lib/prompt/disasterPrompt"

const BATCH_SIZE = 10

const EVENT_PRIORITY: Record<string, number> = {
  OFFICIAL_CONFIRMED: 3,
  CORROBORATED: 2,
  UNVERIFIED: 1,
  REJECTED: 0,
}

async function findOrLinkDisasterEvent(analysis: {
  rawCaptureId: string
  disasterType: DisasterType
  province?: string
  locationName?: string
  validationStatus: ValidationStatus
  officialConfirmed: boolean
  title: string
  description?: string
  city?: string
  severityLevel?: SeverityLevel
}) {
  if (analysis.validationStatus === "REJECTED") return

  const candidateEvents = await db.orm.public.DisasterEvent.where({
    disasterType: analysis.disasterType,
  })
    .orderBy((de) => de.firstDetectedAt.desc())
    .limit(100)
    .all()

  const existingEvent = candidateEvents.find((event) => {
    const sameCity =
      !!analysis.city &&
      !!event.city &&
      analysis.city.toLowerCase() === event.city.toLowerCase()

    const sameLocation =
      !!analysis.locationName &&
      !!event.locationName &&
      analysis.locationName.toLowerCase() === event.locationName.toLowerCase()

    if (analysis.city || analysis.locationName) {
      return sameCity || sameLocation
    }

    return (
      !!analysis.province &&
      !!event.province &&
      analysis.province.toLowerCase() === event.province.toLowerCase()
    )
  })

  if (existingEvent) {
    const shouldUpgrade =
      (EVENT_PRIORITY[analysis.validationStatus] ?? 0) >
      (EVENT_PRIORITY[existingEvent.validationStatus] ?? 0)

    if (shouldUpgrade) {
      await db.orm.public.DisasterEvent.where({ id: existingEvent.id }).update({
        validationStatus: analysis.validationStatus,
        officialConfirmed:
          analysis.officialConfirmed || existingEvent.officialConfirmed,
      })
    }

    await db.orm.public.Analysis.where({
      rawCaptureId: analysis.rawCaptureId,
    }).update({ eventId: existingEvent.id })
  } else {
    const newEvent = await db.orm.public.DisasterEvent.create({
      disasterType: analysis.disasterType,
      title: analysis.title,
      description: analysis.description,
      validationStatus: analysis.validationStatus,
      locationName: analysis.locationName,
      province: analysis.province,
      officialConfirmed: analysis.officialConfirmed,
      city: analysis.city,
      severityLevel: analysis.severityLevel,
    })

    await db.orm.public.Analysis.where({
      rawCaptureId: analysis.rawCaptureId,
    }).update({ eventId: newEvent.id })
  }
}


export async function runAnalysisDisaster() {
  const date = new Date()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: 0,
  })

  try {
    await startScrapeJob(job.id)

    const captures = await db.orm.public.RawCapture.where((rc) =>
      rc.analysis.none()
    )
      .include("source")
      .limit(BATCH_SIZE * 2)
      .all()

    const unanalyzed = captures
      .filter((capture) => capture.source.name !== "AyoBantu")
      .slice(0, BATCH_SIZE)

    if (unanalyzed.length === 0) {
      console.log("[analysis job] tidak ada capture baru untuk dianalisis")
      await completeScrapeJob(job.id)
      return { processed: 0, saved: 0 }
    }

    const rawData = {
      captures: unanalyzed.map((c) => ({
        rawCaptureId: c.id,
        sourceType: c.source.name,
        contentText: c.contentText,
      })),
    }

    const response = await openRouter.chat.completions.create({
      model: "nvidia/nemotron-3.5-lightning:free",
      messages: [
        { role: "system", content: DISASTER_AGENT_PROMPT },
        { role: "user", content: JSON.stringify(rawData) },
      ],
    })

    const message = response.choices[0]?.message

    if (!message?.content) {
      throw new Error("AI tidak mengembalikan hasil analisis")
    }

    const parsed = JSON.parse(message.content)

    let saved = 0

    for (const item of parsed) {
      if (
        !item.rawCaptureId ||
        !unanalyzed.some((c) => c.id === item.rawCaptureId)
      ) {
        console.error("rawCaptureId tidak valid:", item)
        continue
      }

      try {
        await saveAnalysis({
          rawCaptureId: item.rawCaptureId,
          isDisaster: item.isDisaster,
          disasterType: item.disasterType,
          confidenceScore: item.confidenceScore,
          extractedLocation: {
            locationName: item.locationName,
            province: item.province,
          },
        })
        saved++

        if (item.isDisaster) {
          await findOrLinkDisasterEvent(item)
        }
      } catch (err) {
        console.error(`Gagal saveAnalysis untuk ${item.rawCaptureId}:`, err)
      }
    }

    await completeScrapeJob(job.id)

    console.log(
      `[analysis disaster job] processed: ${unanalyzed.length}, saved: ${saved}`
    )

    return { processed: unanalyzed.length, saved }
  } catch (error) {
    console.error("[analysis job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}
