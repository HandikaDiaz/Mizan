import { db } from "@/src/prisma/db"

type DisasterEvent = {
  id: string
  title: string
  disasterType: string | null
  locationName: string | null
  province: string | null
  city: string | null
  severityLevel: string | null
  validationStatus: string
}

export type DisasterLocationMatch = {
  event: DisasterEvent
  matchedBy: "city" | "province" | "alias" | "region"
  matchedValue: string
}

const provinceAliases: Record<string, string[]> = {
  "NUSA TENGGARA TIMUR": ["NTT"],
  "NUSA TENGGARA BARAT": ["NTB"],

  "JAWA BARAT": ["JABAR"],
  "JAWA TENGAH": ["JATENG"],
  "JAWA TIMUR": ["JATIM"],

  "SUMATERA UTARA": ["SUMUT"],
  "SUMATERA BARAT": ["SUMBAR"],
  "SUMATERA SELATAN": ["SUMSEL"],

  "KALIMANTAN BARAT": ["KALBAR"],
  "KALIMANTAN TENGAH": ["KALTENG"],
  "KALIMANTAN SELATAN": ["KALSEL"],
  "KALIMANTAN TIMUR": ["KALTIM"],
  "KALIMANTAN UTARA": ["KALTARA"],

  "SULAWESI UTARA": ["SULUT"],
  "SULAWESI TENGAH": ["SULTENG"],
  "SULAWESI SELATAN": ["SULSEL"],
  "SULAWESI TENGGARA": ["SULTRA"],
  "SULAWESI BARAT": ["SULBAR"],

  "DAERAH ISTIMEWA YOGYAKARTA": ["DIY"],
  "DKI JAKARTA": ["DKI"],
}

const provinceRegions: Record<string, string[]> = {
  KALIMANTAN: [
    "KALIMANTAN BARAT",
    "KALIMANTAN TENGAH",
    "KALIMANTAN SELATAN",
    "KALIMANTAN TIMUR",
    "KALIMANTAN UTARA",
  ],

  JAWA: ["JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR"],

  SUMATERA: [
    "SUMATERA UTARA",
    "SUMATERA BARAT",
    "SUMATERA SELATAN",
    "RIAU",
    "JAMBI",
    "BENGKULU",
    "LAMPUNG",
    "KEPULAUAN RIAU",
    "KEPULAUAN BANGKA BELITUNG",
  ],

  SULAWESI: [
    "SULAWESI UTARA",
    "SULAWESI TENGAH",
    "SULAWESI SELATAN",
    "SULAWESI TENGGARA",
    "SULAWESI BARAT",
    "GORONTALO",
  ],
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toUpperCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function matchDisasterLocation(
  campaignText: string
): Promise<DisasterLocationMatch[]> {
  const text = normalizeText(campaignText)

  if (!text) {
    return []
  }

  const events = await db.orm.public.DisasterEvent.where((event) =>
    event.validationStatus.in(["OFFICIAL_CONFIRMED", "CORROBORATED"])
  ).all()

  const matches: DisasterLocationMatch[] = []

  for (const event of events) {
    const city = normalizeText(event.city)
    const province = normalizeText(event.province)

    // 1. Match city
    if (city && text.includes(city)) {
      matches.push({
        event,
        matchedBy: "city",
        matchedValue: city,
      })

      continue
    }

    // 2. Match province
    if (province && text.includes(province)) {
      matches.push({
        event,
        matchedBy: "province",
        matchedValue: province,
      })

      continue
    }

    // 3. Match alias
    if (province) {
      const aliases = provinceAliases[province] ?? []

      const matchedAlias = aliases.find((alias) =>
        text.includes(normalizeText(alias))
      )

      if (matchedAlias) {
        matches.push({
          event,
          matchedBy: "alias",
          matchedValue: matchedAlias,
        })

        continue
      }
    }

    // 4. Match wilayah umum
    for (const [region, provinces] of Object.entries(provinceRegions)) {
      if (!text.includes(region)) {
        continue
      }

      if (province && provinces.includes(province)) {
        matches.push({
          event,
          matchedBy: "region",
          matchedValue: region,
        })

        break
      }
    }
  }

  return matches
}
