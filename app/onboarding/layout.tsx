import React from "react"
import Link from "next/link"
import Image from "next/image"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="mx-auto w-full max-w-xl flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Primary-Logo.png"
            alt="Mizan"
            width={144}
            height={48}
            className="h-10 w-auto object-contain bg-transparent"
            priority
          />
          <span className="rounded-full bg-warm-yellow px-2 py-0.5 text-xs font-semibold text-ink">
            TESTNET
          </span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 flex flex-col justify-center">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-xl pt-6 text-center text-xs text-ink-muted">
        Mizan Testnet — Zakat & Donasi Lintas Batas Transparan
      </footer>
    </div>
  )
}
