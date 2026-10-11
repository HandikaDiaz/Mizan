export interface AiCampaignDraft {
  title: string
  organizerName: string
  summary: string
  confidenceScore: number
  flaggedReasons: string[]
  matchedDisasterEventId: string | null
  location?: string
}

const AMBIGUOUS_LANGUAGE_KEYWORDS = [
  "ambigu",
  "tidak spesifik",
  "kurang spesifik",
  "kurang jelas",
  "belum bisa dipastikan",
  "perlu verifikasi",
  "perlu diverifikasi",
  "masih perlu",
]

const HIGH_CONFIDENCE_THRESHOLD = 0.6
const LOW_CONFIDENCE_THRESHOLD = 0.2

function hasAmbiguousLanguage(flaggedReasons: string[]): boolean {
  return flaggedReasons.some((reason) =>
    AMBIGUOUS_LANGUAGE_KEYWORDS.some((kw) =>
      reason.toLowerCase().includes(kw)
    )
  )
}

export function validateAiCampaignDraft(
  raw: unknown,
  candidateEventIds: string[]
): AiCampaignDraft | null {
  if (typeof raw !== "object" || raw === null) {
    return null
  }

  const r = raw as Record<string, unknown>

  if (typeof r.title !== "string" || !r.title.trim()) return null
  if (typeof r.organizerName !== "string" || !r.organizerName.trim()) {
    return null
  }

  if (typeof r.summary !== "string") return null

  if (
    typeof r.confidenceScore !== "number" ||
    Number.isNaN(r.confidenceScore) ||
    r.confidenceScore < 0 ||
    r.confidenceScore > 1
  ) {
    return null
  }

  if (
    !Array.isArray(r.flaggedReasons) ||
    !r.flaggedReasons.every((f) => typeof f === "string")
  ) {
    return null
  }

  const flaggedReasons = [...(r.flaggedReasons as string[])]

  let matchedDisasterEventId: string | null = null

  const rawMatchedId = r.matchedDisasterEventId

  if (rawMatchedId !== null && rawMatchedId !== undefined) {
    if (typeof rawMatchedId !== "string") {
      flaggedReasons.push(
        "AI mengembalikan matchedDisasterEventId dengan tipe tidak valid, diabaikan"
      )
    } else if (!candidateEventIds.includes(rawMatchedId)) {
      flaggedReasons.push(
        `AI mengembalikan matchedDisasterEventId ("${rawMatchedId}") yang tidak ada di daftar kandidat, diabaikan`
      )
    } else {
      matchedDisasterEventId = rawMatchedId
    }
  }

  const location =
    typeof r.location === "string" && r.location.trim()
      ? r.location.trim()
      : undefined

  const confidenceScore = r.confidenceScore

  if (hasAmbiguousLanguage(flaggedReasons) && confidenceScore >= HIGH_CONFIDENCE_THRESHOLD) {
    console.warn(
      `[validateAiCampaignDraft] Kemungkinan inkonsistensi: confidenceScore ` +
      `${confidenceScore} tergolong tinggi, tetapi flaggedReasons mengandung ` +
      `bahasa yang menunjukkan keraguan. Perlu review manual ekstra.`
    )
    flaggedReasons.push(
      "[SISTEM] confidenceScore tergolong tinggi namun alasan yang diberikan AI " +
      "mengindikasikan keraguan/ambiguitas — mohon direview manual dengan cermat."
    )
  }

 
  if (matchedDisasterEventId && confidenceScore <= LOW_CONFIDENCE_THRESHOLD) {
    console.warn(
      `[validateAiCampaignDraft] Kemungkinan inkonsistensi: matchedDisasterEventId ` +
      `terisi ("${matchedDisasterEventId}") tetapi confidenceScore sangat rendah ` +
      `(${confidenceScore}). Perlu review manual ekstra.`
    )
    flaggedReasons.push(
      "[SISTEM] Event berhasil dicocokkan namun confidenceScore sangat rendah — " +
      "mohon direview manual untuk memastikan kecocokan ini valid."
    )
  }

  return {
    title: r.title.trim(),
    organizerName: r.organizerName.trim(),
    summary: r.summary,
    confidenceScore,
    flaggedReasons,
    matchedDisasterEventId,
    location,
  }
}