import { aiCampaign } from "@/src/lib/campaign/aiCampaign"
import { guessDisasterType } from "@/src/lib/campaign/campaignDisasterType"
import {
  buildCampaignText,
  extractCampaignFields,
} from "@/src/lib/campaign/extractCampaign"
import {
  findRelatedCamapignDisasterEvents,
  markCaptureChecked,
} from "@/src/lib/campaign/findRelatedCampaignDisaster"
import { matchDisasterLocation } from "@/src/lib/campaign/matchDisasterLocation"
import { validateAiCampaignDraft } from "@/src/lib/campaign/validateAiCampaign"
import { toCategoryCode } from "@/src/lib/campaign-category"
import { convertIdrToWeiBnb } from "@/src/lib/convertToIdr"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { AyobantuResult } from "@/src/lib/type/AyobantuType"
import { RelatedDisasterEvent } from "@/src/lib/type/disasterType"
import { db } from "@/src/prisma/db"
import {
  createDraftCampaign,
  draftCampaignExistsByReference,
} from "@/src/service/campaignService"
import { createScrapeJob } from "@/src/service/scrapeServices"
import { extractLocationFromText } from "@/src/lib/campaign/locationHint"

export async function runAnalysisCampaign() {
  const date = new Date()

  const ayobantuSources = await db.orm.public.Source.where({
    name: "AyoBantu",
    isActive: true,
  }).all()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: ayobantuSources.length,
  })

  try {
    await startScrapeJob(job.id)

    if (ayobantuSources.length === 0) {
      console.error(
        'Source "Ayobantu" tidak ditemukan / tidak aktif, skip analisis.'
      )
      await completeScrapeJob(job.id)
      return []
    }

    const ayobantuSourceIds = ayobantuSources.map((s) => s.id)

    const pendingCaptures = await db.orm.public.RawCapture.where((rc) =>
      rc.sourceId.in(ayobantuSourceIds)
    )
      .where((rc) => rc.campaignCheckedAt.isNull())
      .orderBy((rc) => rc.capturedAt.desc())
      .limit(3)
      .all()

    const results = []

    for (const capture of pendingCaptures) {
      if (!capture.url) {
        console.warn(`RawCapture ${capture.id} tidak punya url, skip`)
        await markCaptureChecked(capture.id)
        continue
      }

      if (await draftCampaignExistsByReference(capture.url)) {
        console.log(`RawCapture ${capture.id}: campaign sudah ada, skip.`)

        await markCaptureChecked(capture.id)

        continue
      }

      let item: AyobantuResult
      try {
        item = JSON.parse(capture.contentText) as AyobantuResult
      } catch (err) {
        console.warn(
          `RawCapture ${capture.id} contentText bukan JSON valid, skip.`,
          err
        )
        await markCaptureChecked(capture.id)
        continue
      }

      const extraction = extractCampaignFields(item)

      console.log("\n========== CAMPAIGN DEBUG ==========")
      console.log("RawCapture ID :", capture.id)
      console.log("Title         :", extraction.title)
      console.log("Category      :", extraction.category)
      console.log("Location      :", extraction.location)
      console.log("Campaigner    :", extraction.campaigner)

      const campaignText = buildCampaignText(extraction)

      console.log("Campaign Text :", campaignText)

      const disasterType = guessDisasterType(campaignText)

      console.log("Disaster Type :", disasterType ?? "TIDAK TERDETEKSI")

      const locationMatches = await matchDisasterLocation(campaignText)

      console.log(
        "Disaster Location :",
        locationMatches.length > 0
          ? locationMatches.map(
              (match) => `${match.matchedValue} (${match.matchedBy})`
            )
          : "TIDAK TERDETEKSI"
      )

      const hasDisasterTypeMatch =
        disasterType !== null && disasterType !== "LAINNYA"

      const hasDisasterLocationMatch = locationMatches.length > 0

      const hasDisasterMatch = hasDisasterTypeMatch || hasDisasterLocationMatch

      let relatedEvents: RelatedDisasterEvent[]

      try {
        relatedEvents = await findRelatedCamapignDisasterEvents(campaignText)
      } catch (err) {
        console.error(
          `Gagal cari related DisasterEvent untuk RawCapture ${capture.id}:`,
          err
        )

        relatedEvents = []
      }

      const locationEvents: RelatedDisasterEvent[] = locationMatches.map(
        (match) => ({
          id: match.event.id,
          title: match.event.title,
          disasterType: match.event.disasterType,
          locationName: match.event.locationName,
          province: match.event.province,
          city: match.event.city,
          severityLevel: match.event.severityLevel,
          validationStatus: match.event.validationStatus,
        })
      )

      relatedEvents = [...relatedEvents, ...locationEvents]

      relatedEvents = Array.from(
        new Map(relatedEvents.map((event) => [event.id, event])).values()
      )

      if (!hasDisasterMatch) {
        console.log(
          `RawCapture ${capture.id}: tidak ada disaster type/location match, skip.`
        )

        await markCaptureChecked(capture.id)
        continue
      }

      console.log(
        "[debug] FINAL RELATED EVENTS:",
        relatedEvents.map((event) => ({
          id: event.id,
          title: event.title,
          province: event.province,
          city: event.city,
        }))
      )

      const rawAiResponse = await aiCampaign({
        extraction,
        url: capture.url,
        relatedEvents,
      })

      if (!rawAiResponse) {
        console.warn(
          `Gagal dapat respons AI untuk RawCapture ${capture.id}, skip.`
        )
        continue
      }

      const candidateEventIds = relatedEvents.map((e) => e.id)

      const aiDraft = validateAiCampaignDraft(rawAiResponse, candidateEventIds)

      if (!aiDraft) {
        console.warn(
          `Respons AI untuk RawCapture ${capture.id} tidak valid, skip.`
        )

        await markCaptureChecked(capture.id)
        continue
      }

      let targetAmountWei = "0"

      if (extraction.targetAmount) {
        try {
          targetAmountWei = await convertIdrToWeiBnb(extraction.targetAmount)
        } catch (err) {
          console.error(
            `Gagal konversi kurs untuk RawCapture ${capture.id}:`,
            err
          )
        }
      }

      const matchedEvent = aiDraft.matchedDisasterEventId
        ? relatedEvents.find((e) => e.id === aiDraft.matchedDisasterEventId)
        : undefined

      const matchedEventLocation = matchedEvent
        ? [matchedEvent.city, matchedEvent.province]
            .filter(Boolean)
            .join(", ") ||
          matchedEvent.locationName ||
          null
        : null

      const textExtractedLocation = extractLocationFromText(campaignText)

      const campaignLocation =
        aiDraft.location ||
        matchedEventLocation ||
        textExtractedLocation ||
        extraction.location ||
        null

      console.log("[aiCampaign] aiDraft.location:", aiDraft.location)
      console.log("[aiCampaign] matched event location:", matchedEventLocation)
      console.log(
        "[aiCampaign] text-extracted location:",
        textExtractedLocation
      )
      console.log("[aiCampaign] final location:", campaignLocation)

      const aiDraftPayload = {
        ...aiDraft,
        source: "ayobantu",
        slug: item.slug,
        externalUrl: capture.url,
        imageUrl: item.image ?? null,
        category: extraction.category,
        campaignType: item.campaignType,
        sourceVerifiedOnPlatform: item.verified,
        sourceRaisedAmountIdr: extraction.collectedAmount,
        sourceTargetAmountIdr: extraction.targetAmount,
        daysLeftText: item.daysLeftText ?? null,
        location: campaignLocation,
        campaignerUrl: item.campaignerUrl ?? null,
      }

      const campaign = await createDraftCampaign({
        title: aiDraft.title || extraction.title,
        organizerName:
          aiDraft.organizerName || extraction.campaigner || "Tidak diketahui",
        aiDraftPayload,
        aiReference: capture.url,
        aiConfidence: aiDraft.confidenceScore,
        targetAmountWei,
        category: toCategoryCode(extraction.category) ?? "BENCANA",
        summary: aiDraft.summary,
        location: campaignLocation,
        days: extraction.daysLeftText,
        image: item.image,
        recipientWallet: process.env.MIZAN_WALLET ?? "",
      })

      await markCaptureChecked(capture.id)

      results.push(campaign)

      console.log(
        `Draft campaign dibuat: "${aiDraft.title}" (confidence: ${aiDraft.confidenceScore}` +
          `${aiDraft.flaggedReasons.length ? `, flagged: ${aiDraft.flaggedReasons.join("; ")}` : ""}` +
          `${aiDraft.matchedDisasterEventId ? `, matched event: ${aiDraft.matchedDisasterEventId}` : ""})`
      )
    }
  } catch (error) {
    console.error("[analysis campagin job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}
