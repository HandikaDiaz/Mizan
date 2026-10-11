import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { cn } from "../src/lib/utils"
import PrivyProviderWrapper from "../components/providers/privy-provider"
import { LanguageProvider } from "../components/site/language-provider"

/**
 * Plus Jakarta Sans — teks.
 * Dibuat Tokotype untuk identitas kota Jakarta (SIL OFL 1.1).
 * Huruf Indonesia untuk produk Indonesia: humanis dan ramah, tapi terminalnya
 * tegas saat ditebalkan. Hangat tanpa jadi kekanak-kanakan.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

/**
 * JetBrains Mono — data.
 * Bukan pilihan "keren-kerenan kripto": angka tabularnya presisi dan
 * 0/O serta 1/l tidak ambigu. Alamat dompet dan nominal harus bisa dibaca
 * ulang karakter per karakter tanpa salah baca.
 */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://mizan.example.id"),
  icons: {
    icon: "/Favicon.png",
    shortcut: "/Favicon.png",
    apple: "/Favicon.png",
  },
  title: {
    default: "Mizan — Zakat & Donasi On-Chain yang Bisa Diaudit",
    template: "%s · Mizan",
  },
  description:
    "Platform zakat dan donasi berbasis kripto di BNB Smart Chain. Setiap donasi tercatat di blockchain dan bisa dilacak sampai ke penerima. Semua data di halaman ini adalah data testnet.",
  keywords: [
    "zakat",
    "donasi",
    "zakat online",
    "donasi kripto",
    "BNB Chain",
    "Web3",
    "transparansi",
    "blockchain",
  ],
  authors: [{ name: "Tim Mizan" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Mizan",
    title: "Mizan — Zakat & Donasi On-Chain yang Bisa Diaudit",
    description:
      "Setiap rupiah punya jejaknya. Donasi tercatat di BNB Smart Chain dan bisa dilacak sampai penerima.",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#F8F3F9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        jakarta.variable,
        jetbrains.variable,
        "font-sans"
      )}
    >
      <body className="min-h-dvh bg-canvas text-ink">
        <PrivyProviderWrapper>
          <LanguageProvider>{children}</LanguageProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  )
}
