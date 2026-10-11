import * as cheerio from "cheerio"

export interface CampaignDetail {
  title: string
  daysLeftText?: number
}

function cleanCampaignTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s+\|\s+AyoBantu.*$/i, "")
    .replace(/\s+-\s+AyoBantu.*$/i, "")
    .trim()
}

export async function getFullCampaignTitle(
  url: string,
  fallbackTitle: string
): Promise<CampaignDetail> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
    })

    if (!response.ok) {
      console.warn(
        `[AyoBantu] gagal fetch detail title ${url}: ${response.status}`
      )

      return {
        title: fallbackTitle,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)



    const $daysLeft = $(".info-additional li")
      .filter((_, el) => $(el).text().toLowerCase().includes("hari lagi"))
      .first()

    const daysText = $daysLeft.find("strong").first().text().trim()

    const daysLeftText = daysText ? parseInt(daysText, 10) : 0


    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim()

    if (ogTitle && !ogTitle.endsWith("...")) {
      return {
        title: cleanCampaignTitle(ogTitle),
        daysLeftText,
      }
    }

    const twitterTitle = $('meta[name="twitter:title"]').attr("content")?.trim()

    if (twitterTitle && !twitterTitle.endsWith("...")) {
      return {
        title: cleanCampaignTitle(twitterTitle),
        daysLeftText,
      }
    }

    const documentTitle = $("title").first().text().trim()

    if (documentTitle && !documentTitle.endsWith("...")) {
      return {
        title: cleanCampaignTitle(documentTitle),
        daysLeftText,
      }
    }

    const heading = $("h1, h2, h3, h4, h5, h6")
      .filter((_, el) => {
        const text = $(el).text().trim()

        return (
          text.length > 0 &&
          !text.toLowerCase().includes("donasi") &&
          !text.toLowerCase().includes("terkumpul")
        )
      })
      .first()
      .text()
      .trim()

    if (heading && !heading.endsWith("...")) {
      return {
        title: cleanCampaignTitle(heading),
        daysLeftText,
      }
    }

    return {
      title: fallbackTitle,
      daysLeftText,
    }
  } catch (error) {
    console.warn(`[AyoBantu] gagal mengambil full title ${url}:`, error)

    return {
      title: fallbackTitle,
    }
  }
}
