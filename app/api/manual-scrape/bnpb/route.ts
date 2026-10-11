import { scrapeBNPB } from "@/src/agents/tools/official/scrapeBnpb"
import { createContentHash } from "@/src/lib/hash"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { createRawCapture } from "@/src/service/rawCapturedService"
import { createScrapeJob } from "@/src/service/scrapeServices"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const { startDate, endDate } = body

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate dan endDate harus diisi" })
  }

  const job = await createScrapeJob({ startDate, endDate, totalSources: 1 })

  try {
    await startScrapeJob(job.id)

    const results = await scrapeBNPB({ startDate, endDate })

    let created = 0
    let skipped = 0

    for (const item of results) {
      const content = JSON.stringify(item)

      try {
        await createRawCapture({
          sourceId: item.sourceId,
          contentText: content,
          contentHash: createContentHash(content),
        })

        created++
      } catch (error) {
        console.error(
          `Gagal createRawCapture untuk item BNPB:`,
          item.number,
          error
        )
        skipped++
      }
    }

    await completeScrapeJob(job.id)

    return Response.json({
      success: true,
      dateRange: { startDate, endDate },
      matched: results.length,
      created,
      skipped,
    })
  } catch (error) {
    console.error("[manual scrape BNPB] gagal:", error)
    await failScrapeJob(job.id, error)

    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}