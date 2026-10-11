import { searchNews } from "@/src/agents/tools/news/searchNews"
import { createContentHash } from "@/src/lib/hash"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { db } from "@/src/prisma/db"
import { createRawCapture } from "@/src/service/rawCapturedService"
import { createScrapeJob } from "@/src/service/scrapeServices"

export async function runNews() {
  const today = new Date().toISOString().split("T")[0]

  const job = await createScrapeJob({
    startDate: today,
    endDate: today,
    totalSources: 1,
  })

  try {
    await startScrapeJob(job.id)

    const results = await searchNews({ startDate: today, endDate: today })

    let created = 0
    let duplicates = 0

    for (const item of results) {
      const content = JSON.stringify(item)
      const contentHash = createContentHash(content)

      try {
        const existingHash = await db.orm.public.RawCapture.where({
          contentHash,
        })
        
        if(existingHash) {
          duplicates++

          continue
        }

        await createRawCapture({
          sourceId: item.sourceId,
          url: item.url,
          authorName: item.sourceName,
          contentText: content,
          contentHash: createContentHash(content),
          publishedAt: item.publishedAt.toISOString(),
        })
        created++
      } catch (captureErr) {
        console.error(`Gagal createRawCapture untuk item News:`, captureErr)
      }
    }

    await completeScrapeJob(job.id)

    console.log(`[News job] scraped: ${results.length}, created: ${created}`)

    return { scraped: results.length, created }
  } catch (error) {
    console.error("[News job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}