
const KNOWN_PROVINCES = [
  "ACEH", "SUMATERA UTARA", "SUMATERA BARAT", "SUMATERA SELATAN", "RIAU",
  "JAMBI", "BENGKULU", "LAMPUNG", "KEPULAUAN RIAU", "KEPULAUAN BANGKA BELITUNG",
  "DKI JAKARTA", "JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR",
  "DAERAH ISTIMEWA YOGYAKARTA", "BANTEN",
  "BALI", "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR",
  "KALIMANTAN BARAT", "KALIMANTAN TENGAH", "KALIMANTAN SELATAN",
  "KALIMANTAN TIMUR", "KALIMANTAN UTARA",
  "SULAWESI UTARA", "SULAWESI TENGAH", "SULAWESI SELATAN",
  "SULAWESI TENGGARA", "SULAWESI BARAT", "GORONTALO",
  "MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT",
]

const PROVINCE_ALIASES: Record<string, string> = {
  NTT: "NUSA TENGGARA TIMUR",
  NTB: "NUSA TENGGARA BARAT",
  JABAR: "JAWA BARAT",
  JATENG: "JAWA TENGAH",
  JATIM: "JAWA TIMUR",
  SUMUT: "SUMATERA UTARA",
  SUMBAR: "SUMATERA BARAT",
  SUMSEL: "SUMATERA SELATAN",
  KALBAR: "KALIMANTAN BARAT",
  KALTENG: "KALIMANTAN TENGAH",
  KALSEL: "KALIMANTAN SELATAN",
  KALTIM: "KALIMANTAN TIMUR",
  KALTARA: "KALIMANTAN UTARA",
  SULUT: "SULAWESI UTARA",
  SULTENG: "SULAWESI TENGAH",
  SULSEL: "SULAWESI SELATAN",
  SULTRA: "SULAWESI TENGGARA",
  SULBAR: "SULAWESI BARAT",
  DIY: "DAERAH ISTIMEWA YOGYAKARTA",
  DKI: "DKI JAKARTA",
}

const REGION_ALIASES = [
  "JABODETABEK",
  "BODETABEK",
  "KALIMANTAN",
  "SUMATERA",
  "SULAWESI",
  "JAWA",
]

function normalize(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}


export function extractLocationFromText(text: string): string | null {
  const normalized = normalize(text)
  if (!normalized) return null


  for (const region of REGION_ALIASES) {
    if (normalized.includes(region)) {
      return toTitleCase(region)
    }
  }

  for (const [alias, province] of Object.entries(PROVINCE_ALIASES)) {
    if (normalized.includes(alias)) {
      return toTitleCase(alias)
    }
  }

  for (const province of KNOWN_PROVINCES) {
    if (normalized.includes(province)) {
      return toTitleCase(province)
    }
  }

  return null
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}