import { BNPBResult } from "@/src/lib/type/bnpbType"
import { db } from "../../../../src/prisma/db"
import * as cheerio from "cheerio"
import { createContentHash } from "../../../lib/hash"
import { parseBnpbDate, parseNumber } from "@/src/lib/parseNumber"

export interface scrapeBnpbInput {
  startDate?: string
  endDate?: string
}

function toBnpbDateFormat(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${month}/${day}/${year}`  
}

export async function scrapeBNPB(
  input?: scrapeBnpbInput
): Promise<BNPBResult[]> {
  const sources = await db.orm.public.Source.where({
    dataFormats: "HTML",
    isActive: true,
  }).all()

  const rawResults: BNPBResult[] = []

  for (const source of sources) {
    let response: Response

    if (input?.startDate && input?.endDate) {
      const formData = new URLSearchParams({
        s_kejadian: "", // kosongkan = semua jenis kejadian
        tgl_awal: toBnpbDateFormat(input.startDate),
        tgl_akhir: toBnpbDateFormat(input.endDate),
        submit: "Cari",
      })

      response = await fetch(source.baseUrlOrHandle, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })
    } else {
      response = await fetch(source.baseUrlOrHandle)
    }

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`)
      continue
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $("table tbody tr").each((_, element) => {
      const cells = $(element)
        .find("td")
        .map((_, cell) => {
          return $(cell).text().replace(/\s+/g, " ").trim()
        })
        .get()

      if (cells.length === 0) {
        return
      }

      rawResults.push({
        sourceId: source.id,
        number: cells[0] || "",
        regencyId: cells[1] || "",
        disasterCode: cells[2] || "",
        disasterDate: cells[3] || "",
        disasterType: cells[4] || "",
        location: cells[5] || "",
        regency: cells[6] || "",
        province: cells[7] || "",

        documentation: cells[8] || undefined,

        reason: cells[9] || undefined,

        died: parseNumber(cells[10]),

        disappeared: parseNumber(cells[11]),

        injured: parseNumber(cells[12]),

        damagedHouse: parseNumber(cells[13]),

        destroyedHouse: parseNumber(cells[14]),

        floodedHouse: parseNumber(cells[15]),

        destroyedInfrastructure: cells[16] || undefined,
      })
    })
  }

  if (rawResults.length === 0) {
    return []
  }


  let filteredResult = rawResults

  const itemsWithHash = filteredResult.map((item) => ({
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
    `BNPB: ${rawResults.length} total, ${newItems.length} baru, ${
      rawResults.length - newItems.length
    } sudah ada (skip)`
  )

  return newItems.map((x) => x.item)
}
