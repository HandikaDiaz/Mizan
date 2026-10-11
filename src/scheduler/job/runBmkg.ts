import { fetchJsonSources } from "@/src/agents/tools/official/JsonSources"
import { createContentHash } from "@/src/lib/hash"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { db } from "@/src/prisma/db"
import { createRawCapture } from "@/src/service/rawCapturedService"
import { createScrapeJob } from "@/src/service/scrapeServices"

export async function runBmkg() {
  const date = new Date()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: 1,
  })

  try {
    await startScrapeJob(job.id)

    const results = await fetchJsonSources()

    let created = 0
    let duplicates = 0

    for (const item of results) {
      const content = JSON.stringify(item.data)
      const contentHash = createContentHash(content)
      try {
        const existingHash = await db.orm.public.RawCapture.where({
          contentHash,
        })

        if (existingHash) {
          duplicates++

          continue
        }
        await createRawCapture({
          sourceId: item.source.id,
          contentText: content,
          contentHash: createContentHash(content),
        })
        created++
      } catch (captureErr) {
        console.error(`Gagal createRawCapture untuk item BMKG:`, captureErr)
      }
    }

    await completeScrapeJob(job.id)

    console.log(`[BMKG job] scraped: ${results.length}, created: ${created}`)

    return { scraped: results.length, created }
  } catch (error) {
    console.error("[BMKG job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}
