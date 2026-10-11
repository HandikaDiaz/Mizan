const CATEGORY_LABELS: Record<string, string> = {
  ZAKAT: "Zakat",
  DONASI_UMUM: "Donasi Umum",
  WAKAF: "Wakaf",
  BENCANA: "Tanggap Bencana",
}

export const formatCampaignCategory = (category: string): string => {
  const normalized = category.trim()
  return CATEGORY_LABELS[normalized] ?? normalized
}
