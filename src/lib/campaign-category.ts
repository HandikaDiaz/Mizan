/* =========================================================================
   Single source of truth for campaign categories.

   The DB `campaign.category` column is an enum (CampaignCategory) that stores
   short CODES: ZAKAT | DONASI_UMUM | WAKAF | BENCANA.
   The UI shows Indonesian LABELS: Zakat | Donasi Umum | Wakaf | Tanggap Bencana.

   Use these helpers whenever you read from or write to the category column so
   the code<->label conversion stays consistent across admin, beneficiary, and
   the public pages.
   ========================================================================= */

export const CAMPAIGN_CATEGORY_CODES = [
  "ZAKAT",
  "DONASI_UMUM",
  "WAKAF",
  "BENCANA",
] as const

export type CampaignCategoryCode = (typeof CAMPAIGN_CATEGORY_CODES)[number]

// Code -> human label shown in the UI.
export const CATEGORY_LABEL: Record<CampaignCategoryCode, string> = {
  ZAKAT: "Zakat",
  DONASI_UMUM: "Donasi Umum",
  WAKAF: "Wakaf",
  BENCANA: "Tanggap Bencana",
}

// Options for a <select>: value is the DB code, label is the display text.
export const CATEGORY_OPTIONS: { value: CampaignCategoryCode; label: string }[] =
  CAMPAIGN_CATEGORY_CODES.map((code) => ({
    value: code,
    label: CATEGORY_LABEL[code],
  }))

// Accepts a code or a label (any casing) and returns the canonical code, or null.
export function toCategoryCode(
  value: string | null | undefined,
): CampaignCategoryCode | null {
  if (!value) return null
  const raw = value.trim()

  const asCode = CAMPAIGN_CATEGORY_CODES.find(
    (code) => code.toLowerCase() === raw.toLowerCase(),
  )
  if (asCode) return asCode

  const fromLabel = (Object.keys(CATEGORY_LABEL) as CampaignCategoryCode[]).find(
    (code) => CATEGORY_LABEL[code].toLowerCase() === raw.toLowerCase(),
  )
  return fromLabel ?? null
}

// Code (or label) -> display label. Falls back to "Donasi Umum".
export function toCategoryLabel(value: string | null | undefined): string {
  const code = toCategoryCode(value)
  return code ? CATEGORY_LABEL[code] : "Donasi Umum"
}
