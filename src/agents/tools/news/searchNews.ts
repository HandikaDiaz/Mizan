import { fetchRssSources } from "../../../lib/rssFetchers"
import { db } from "@/src/prisma/db"
import { createContentHash } from "@/src/lib/hash"

export interface SearchNewsInput {
  startDate: string
  endDate: string
}

export interface NewsResult {
  title: string
  url: string
  sourceId: string
  sourceName: string
  description?: string
  publishedAt: Date
}

export const DISASTER_KEYWORDS = [
  "gempa",
  "banjir",
  "longsor",
  "tsunami",
  "erupsi",
  "gunung meletus",
  "kebakaran",
  "puting beliung",
  "kekeringan",
]

export async function searchNews(input: SearchNewsInput): Promise<NewsResult[]> {
  const feeds = await fetchRssSources()

  const startDate = new Date(`${input.startDate}T00:00:00`)
  const endDate = new Date(`${input.endDate}T23:59:59.999`)

  const rawResults: NewsResult[] = []

  for (const feed of feeds) {
    for (const item of feed.items) {
      if (!item.pubDate) {
        continue
      }

      const content = `
        ${item.title ?? ""}
        ${item.contentSnippet ?? ""}
        ${item.content ?? ""}
      `.toLowerCase()

      const isDisaster = DISASTER_KEYWORDS.some((keyword) =>
        content.includes(keyword)
      )

      if (!isDisaster) {
        continue
      }

      const publishedAt = new Date(item.pubDate)
      const isInRange = publishedAt >= startDate && publishedAt <= endDate

      if (!isInRange) {
        continue
      }

      rawResults.push({
        title: item.title ?? "",
        url: item.link ?? "",
        sourceId: feed.source.id,
        sourceName: feed.source.name,
        description: item.contentSnippet ?? item.content,
        publishedAt,
      })
    }
  }

  if (rawResults.length === 0) {
    return []
  }

  const itemsWithHash = rawResults.map((item) => ({
    item,
    hash: createContentHash(JSON.stringify(item)),
  }))

  const allHashes = itemsWithHash.map((x) => x.hash)

  const existingRecords = await db.orm.public.RawCapture.where((rc) =>
    rc.contentHash.in(allHashes)
  ).all()

  const existingHashSet = new Set(existingRecords.map((r) => r.contentHash))

  const newItems = itemsWithHash.filter((x) => !existingHashSet.has(x.hash))

  console.log(
    `News: ${rawResults.length} total (setelah filter keyword), ${newItems.length} baru, ${
      rawResults.length - newItems.length
    } sudah ada (skip)`
  )

  return newItems.map((x) => x.item)
}