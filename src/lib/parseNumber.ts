export function parseNumber(value?: string): number {
  if (!value) return 0

  const cleaned = value.replace(/[^\d]/g, "").trim()

  return cleaned ? Number(cleaned) : 0
}

export function parseBnpbDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}