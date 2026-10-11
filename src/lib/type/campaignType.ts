export interface AiCampaignDraft {
  title: string
  organizerName: string
  summary: string
  confidenceScore: number
  flaggedReasons: string[]
  matchedDisasterEventId: string | null
}

const LOCATION_ALIASES: Record<string, string> = {

  sumatera: "Sumatera",
  sumatra: "Sumatera",

  jawa: "Jawa",

  kalimantan: "Kalimantan",
  borneo: "Kalimantan",

  sulawesi: "Sulawesi",
  celebes: "Sulawesi",

  papua: "Papua",

  "nusa tenggara": "Nusa Tenggara",

  jabodetabek: "Jabodetabek",
  jabodabek: "Jabodetabek",

  aceh: "Aceh",
  nad: "Aceh",
  "nanggroe aceh darussalam": "Aceh",


  "sumatera utara": "Sumatera Utara",
  "sumatra utara": "Sumatera Utara",
  sumut: "Sumatera Utara",

  "sumatera barat": "Sumatera Barat",
  "sumatra barat": "Sumatera Barat",
  sumbar: "Sumatera Barat",

  riau: "Riau",

  "kepulauan riau": "Kepulauan Riau",
  "kep riau": "Kepulauan Riau",
  kepri: "Kepulauan Riau",

  jambi: "Jambi",

  "sumatera selatan": "Sumatera Selatan",
  "sumatra selatan": "Sumatera Selatan",
  sumsel: "Sumatera Selatan",

  bengkulu: "Bengkulu",

  lampung: "Lampung",

  "kepulauan bangka belitung": "Kepulauan Bangka Belitung",
  "bangka belitung": "Kepulauan Bangka Belitung",
  babel: "Kepulauan Bangka Belitung",

  jakarta: "DKI Jakarta",
  "dki jakarta": "DKI Jakarta",
  dki: "DKI Jakarta",

  banten: "Banten",

  "jawa barat": "Jawa Barat",
  "jabar": "Jawa Barat",

  "jawa tengah": "Jawa Tengah",
  jateng: "Jawa Tengah",

  yogyakarta: "DI Yogyakarta",
  jogja: "DI Yogyakarta",
  diy: "DI Yogyakarta",
  "daerah istimewa yogyakarta": "DI Yogyakarta",

  "jawa timur": "Jawa Timur",
  jatim: "Jawa Timur",

  bali: "Bali",

  "nusa tenggara barat": "Nusa Tenggara Barat",
  "ntb": "Nusa Tenggara Barat",

  "nusa tenggara timur": "Nusa Tenggara Timur",
  ntt: "Nusa Tenggara Timur",

  "kalimantan barat": "Kalimantan Barat",
  kalbar: "Kalimantan Barat",

  "kalimantan tengah": "Kalimantan Tengah",
  kalteng: "Kalimantan Tengah",

  "kalimantan selatan": "Kalimantan Selatan",
  kalsel: "Kalimantan Selatan",

  "kalimantan timur": "Kalimantan Timur",
  kaltim: "Kalimantan Timur",

  "kalimantan utara": "Kalimantan Utara",
  kaltara: "Kalimantan Utara",

  "sulawesi utara": "Sulawesi Utara",
  sulut: "Sulawesi Utara",

  gorontalo: "Gorontalo",

  "sulawesi tengah": "Sulawesi Tengah",
  sulteng: "Sulawesi Tengah",

  "sulawesi barat": "Sulawesi Barat",
  sulbar: "Sulawesi Barat",

  "sulawesi selatan": "Sulawesi Selatan",
  sulsel: "Sulawesi Selatan",

  "sulawesi tenggara": "Sulawesi Tenggara",
  sultra: "Sulawesi Tenggara",

  maluku: "Maluku",

  "maluku utara": "Maluku Utara",
  malut: "Maluku Utara",


  "papua barat": "Papua Barat",
  pabar: "Papua Barat",

  "papua tengah": "Papua Tengah",

  "papua pegunungan": "Papua Pegunungan",

  "papua selatan": "Papua Selatan",

  "papua barat daya": "Papua Barat Daya",
}

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type campaignCategory = "ZAKAT" | "DONASI_UMUM" | "WAKAF" | "BENCANA"

export interface CreateDraftCampaignInput {
  title: string
  organizerName: string
  aiDraftPayload: { [key: string]: JsonValue }
  aiReference: string
  aiConfidence: number
  targetAmountWei: string
  category: campaignCategory
  summary: string
  location?: string | null
  recipientWallet: string
  days: number
  image?: string
}
