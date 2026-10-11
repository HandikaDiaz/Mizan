import { scrapeAyobantu } from "@/src/agents/tools/scrape/scrapeAyoBantu"
import { createContentHash } from "@/src/lib/hash"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { db } from "@/src/prisma/db"
import { createRawCapture } from "@/src/service/rawCapturedService"
import { createScrapeJob } from "@/src/service/scrapeServices"

export async function runAyoBantu() {
  const date = new Date()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: 1,
  })

  try {
    await startScrapeJob(job.id)

    const results = await scrapeAyobantu({maxPages: 20})

    let created = 0
    let duplicates = 0

    for (const item of results) {
      const content = JSON.stringify(item)
      const contentHash = createContentHash(content)

      try {
        const existingHash = await db.orm.public.RawCapture.where({
          contentHash,
        }).first()

        if (existingHash) {
          duplicates++

          continue
        }

        await createRawCapture({
          sourceId: item.sourceId,
          url: item.url,
          authorName: item.campaigner,
          contentText: content,
          contentHash,
          publishedAt: new Date().toISOString(),
        })

        created++
        
      } catch (error) {
        console.error(`Gagal createRawCapture untuk item AyoBantu:`, error)
      }
    }

    await completeScrapeJob(job.id)

    return { scraped: results.length, created }
  } catch (error) {
    console.error("[AyoBantu job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}
