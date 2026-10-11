/* =========================================================================
   Shared dashboard types, navigation, and legacy admin presentation data.
   Donor/beneficiary totals are loaded from CampaignPayment at runtime.
   ========================================================================= */

// ── Tipe umum ──────────────────────────────────────────────────────────────

export type StatItem = {
  label: string
  value: string
  unit: string
  icon: string // nama ikon lucide-react
}

export type ActivityItem = {
  id: string
  deskripsi: string
  nominal: string
  satuan: "BNB" | "USDT"
  hash: string
  hashShort: string
  waktu: string
}

export type CampaignReview = {
  id: string
  title: string
  organizerName: string
  targetAmountWei: string
  raisedAmountWei: string
  currency: string
  donorCount: number
  status: "ACTIVE" | "COMPLETED" | "CLOSED"
  reviewStatus?: "AI_DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED"
  source?: "AI_MOCK" | "MANUAL"
  aiDraft?: unknown | null
  aiReference?: string | null
  aiConfidence?: number | null
  recipientWallet?: string | null
  // Presentation fields shown on the public card / detail page.
  category?: string
  image?: string | null
  location?: string | null
  summary?: string | null
  daysLeft?: number
  // Backward compatibility fields
  judul?: string
  penyelenggara?: string
  terkumpul?: number
  target?: number
  satuan?: "BNB" | "USDT" | string
  donatur?: number
}

// ── Konstanta ──────────────────────────────────────────────────────────────

export const EXPLORER_URL = "https://testnet.bscscan.com"

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`
}

// ── Admin ──────────────────────────────────────────────────────────────────

export const ADMIN_STATS: StatItem[] = [
  {
    label: "Total terkumpul",
    value: "37,35",
    unit: "BNB",
    icon: "Wallet",
  },
  {
    label: "Total tersalur",
    value: "31,10",
    unit: "BNB",
    icon: "ArrowUpRight",
  },
  {
    label: "Kampanye aktif",
    value: "4",
    unit: "kampanye",
    icon: "Megaphone",
  },
  {
    label: "Total donatur",
    value: "503",
    unit: "orang",
    icon: "Users",
  },
]

export const ADMIN_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-001",
    deskripsi: "Donasi masuk ke kampanye Bantuan Pendidikan Lombok",
    nominal: "0,50",
    satuan: "BNB",
    hash: "0x9c41e7b2a034f8901c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    hashShort: "0x9c41…3a4b",
    waktu: "2 menit lalu",
  },
  {
    id: "act-002",
    deskripsi: "Pencairan tahap 2 ke Yayasan Nurul Iman",
    nominal: "3,96",
    satuan: "BNB",
    hash: "0x6de3b880c7a4e591028f3d4c5b6a7980e1f2d3c4b5a69708e9f0a1b2c3d4e5f6",
    hashShort: "0x6de3…e5f6",
    waktu: "1 jam lalu",
  },
  {
    id: "act-003",
    deskripsi: "Kampanye baru diajukan: Renovasi Mushola Garut",
    nominal: "—",
    satuan: "BNB",
    hash: "0x2f80a1c9b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    hashShort: "0x2f80…e9f0",
    waktu: "3 jam lalu",
  },
  {
    id: "act-004",
    deskripsi: "Donasi masuk ke kampanye Air Bersih Sumba",
    nominal: "1,20",
    satuan: "BNB",
    hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    hashShort: "0xa1b2…a1b2",
    waktu: "5 jam lalu",
  },
  {
    id: "act-005",
    deskripsi: "Bukti penyaluran diunggah untuk kampanye Sembako Bekasi",
    nominal: "—",
    satuan: "USDT",
    hash: "0xf0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3",
    hashShort: "0xf0e1…c4d3",
    waktu: "1 hari lalu",
  },
]

// ── Navigasi sidebar ───────────────────────────────────────────────────────

export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: number
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/admin", icon: "LayoutDashboard" },
  { label: "Kampanye", href: "/admin/campaigns", icon: "Megaphone", badge: 2 },
  { label: "Penyaluran", href: "/admin/penyaluran", icon: "ArrowUpRight" },
  { label: "Pengaturan", href: "/admin/profile", icon: "Settings" },
]

export const BENEFACTOR_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/benefactor", icon: "LayoutDashboard" },
  { label: "Donasi Saya", href: "/benefactor/riwayat", icon: "History" },
  { label: "Jelajahi Kampanye", href: "/benefactor/jelajahi", icon: "Search" },
  { label: "Pengaturan", href: "/benefactor/profile", icon: "Settings" },
]

export const BENEFICIARY_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/beneficiary", icon: "LayoutDashboard" },
  { label: "Kampanye Saya", href: "/beneficiary/campaigns", icon: "Megaphone" },
  { label: "Pengaturan", href: "/beneficiary/profile", icon: "Settings" },
]

// ── Benefactor (Donatur) ───────────────────────────────────────────────────

export const BENEFACTOR_WALLET = {
  address: "0x4d2A7B8c9E1f3a5D6e8F0b2C4d6E8f10",
  addressShort: "0x4d2A…8f10",
}

// ── Beneficiary (Penerima) ─────────────────────────────────────────────────

export const BENEFICIARY_WALLET = {
  address: "0xB15c3D4e5F6a7B8C9d0E1f2A3b4C5D6E2e77",
  addressShort: "0xB15c…2e77",
}
