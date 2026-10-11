import { getFullCampaignTitle } from "@/src/lib/campaign/fullCampaignTitle"
import { AyobantuResult } from "@/src/lib/type/AyobantuType"
import { db } from "@/src/prisma/db"
import * as cheerio from "cheerio"

export interface scrapeAyobantuInput {
  category?: string
  status?: string
  campaignType?: string
  sort?: string
  maxPages?: number
}

function parseRupiah(text: string): number | null {
  if (!text) return null

  if (/tidak terbatas|∞/i.test(text)) {
    return null
  }

  const digits = text.replace(/[^\d]/g, "")

  return digits ? parseInt(digits, 10) : 0
}

function buildQuery(input?: scrapeAyobantuInput, page?: number): string {
  const params = new URLSearchParams()

  params.set("category", input?.category || "1")
  params.set("status", input?.status || "1")
  params.set("campaign_type", input?.campaignType || "normal")
  params.set("sort", input?.sort || "desc")

  if (page && page > 1) {
    params.set("page", String(page))
  }

  return params.toString()
}

export async function scrapeAyobantu(
  input?: scrapeAyobantuInput
): Promise<AyobantuResult[]> {
  const sources = await db.orm.public.Source.where({
    dataFormats: "HTML",
    isActive: true,
    name: "AyoBantu",
  }).all()

  const rawResults: AyobantuResult[] = []

  const maxPages = input?.maxPages ?? 20

  for (const source of sources) {
    let page = 1
    let hasNextPage = true

    while (hasNextPage && page <= maxPages) {
      const query = buildQuery(input, page)

      const targetUrl = query
        ? `${source.baseUrlOrHandle}?${query}`
        : source.baseUrlOrHandle

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
          Accept: "text/html",
        },
      })

      if (!response.ok) {
        console.error(
          `Failed to fetch ${source.name} (page ${page}): ${response.status}`
        )

        break
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      const campaignLinks = $('a[href$="/donate"]').toArray()

      for (const donateEl of campaignLinks) {
        const $donate = $(donateEl)

        const $card = $donate.closest(".single-blog")

        const $titleLink = $card
          .find('a[href*="/campaign/"]')
          .filter((_, el) => {
            const href = $(el).attr("href") || ""

            return (
              !href.endsWith("/donate") &&
              !href.includes("?campaigner=") &&
              $(el).find("h6, h5, strong").length > 0
            )
          })
          .first()

        const listingTitle = $titleLink.text().trim()

        const relativeUrl = $titleLink.attr("href") || ""

        const slug = relativeUrl.split("/campaign/")[1]?.split(/[/?]/)[0] || ""

        if (!listingTitle || !relativeUrl || !slug) {
          continue
        }

        const campaignUrl = relativeUrl.startsWith("http")
          ? relativeUrl
          : `https://ayobantu.com${
              relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`
            }`

        const campaignDetail = await getFullCampaignTitle(
          campaignUrl,
          listingTitle
        )

        const title = campaignDetail.title
        const daysLeftText = campaignDetail.daysLeftText ?? 0

        const image = $card.find("img").first().attr("src") || undefined

        const category = $card.find(".badge").first().text().trim() || undefined

        const cardText = $card.text()

        const collectedMatch = cardText.match(/Rp[\s.\d]+terkumpul/)

        const targetMatch = cardText.match(
          /dari\s+(Rp[\s.\d]+|∞\s*tidak terbatas)/
        )

        const $campaignerLink = $card.find('a[href*="?campaigner="]').first()

        const campaigner = $campaignerLink.text().trim() || undefined

        const campaignerUrl = $campaignerLink.attr("href") || undefined

        const verified = $card.find('img[alt="Verified User"]').length > 0

        rawResults.push({
          sourceId: source.id,
          slug,
          title,
          summary: title,
          url: campaignUrl,
          image,
          category: category || undefined,
          campaignType: input?.campaignType || "normal",
          collectedAmount: parseRupiah(collectedMatch?.[0] || "") ?? 0,
          targetAmount: parseRupiah(targetMatch?.[1] || ""),
          campaigner,
          campaignerUrl,
          verified,
          daysLeftText: daysLeftText ? String(daysLeftText) : undefined,
        })

      }

      hasNextPage = $('a:contains("Next")').length > 0

      page += 1
    }
  }

  const newItems: AyobantuResult[] = []

  for (const item of rawResults) {
    const existing = await db.orm.public.RawCapture.where({
      url: item.url,
    }).first()

    if (!existing) {
      newItems.push(item)
    }
  }

  console.log(
    `AyoBantu: ${rawResults.length} total, ${newItems.length} baru, ${
      rawResults.length - newItems.length
    } sudah ada (skip)`
  )

  return rawResults
}
