import { db } from "@/src/prisma/db"
import { createContentHash } from "@/src/lib/hash"

export async function fetchJsonSources() {
  const sources = await db.orm.public.Source.where({
    dataFormats: "JSON",
    isActive: true,
  }).all()

  const rawResults: Array<{ source: (typeof sources)[number]; data: unknown }> = []

  for (const source of sources) {
    const response = await fetch(source.baseUrlOrHandle)

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`)
      continue
    }

    const json = await response.json()

    const gempaData = json?.Infogempa?.gempa

    const items = Array.isArray(gempaData)
      ? gempaData
      : gempaData
      ? [gempaData]
      : []

    if (items.length === 0) {
      console.warn(`Tidak ada data gempa dari ${source.name}, cek struktur JSON`)
    }

    for (const item of items) {
      rawResults.push({
        source,
        data: item,
      })
    }
  }

  if (rawResults.length === 0) {
    return []
  }

  const itemsWithHash = rawResults.map((item) => ({
    item,
    hash: createContentHash(JSON.stringify(item.data)),
  }))

  const allHashes = itemsWithHash.map((x) => x.hash)

  const existingRecords = await db.orm.public.RawCapture.where((rc) =>
    rc.contentHash.in(allHashes)
  ).all()

  const existingHashSet = new Set(existingRecords.map((r) => r.contentHash))

  const newItems = itemsWithHash.filter((x) => !existingHashSet.has(x.hash))

  console.log(
    `BMKG SOURCES: ${rawResults.length} total, ${newItems.length} baru, ${
      rawResults.length - newItems.length
    } sudah ada (skip)`
  )

  return newItems.map((x) => x.item)
}