import type { Metadata } from "next"
import Link from "next/link"

import { PaymentHistory } from "@/components/dashboard/payment-history"
import { TESTNET_NOTICE } from "@/src/lib/site-data"

export const metadata: Metadata = {
  title: "Donasi Saya — Dashboard Donatur",
}

export default function BenefactorRiwayatPage() {
  return (
    <div className="mx-auto max-w-[1240px]">
      <div>
        <p className="mz-overline">Donatur</p>
        <h1 className="mt-3 text-h1 text-ink">Donasi Saya</h1>
        <p className="mt-3 max-w-3xl text-sm text-ink-body">
          Riwayat payment MOCK dan ONCHAIN dari wallet Privy yang sedang login.
          Transaksi on-chain bisa dibuka di BscScan.
        </p>
        <p className="mt-2 text-xs text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      <PaymentHistory />

      <p className="mt-6 text-sm text-ink-muted">
        Ingin mendukung kampanye lain?{" "}
        <Link
          href="/benefactor/jelajahi"
          className="font-semibold text-primary-purple hover:text-brand-violet"
        >
          Jelajahi kampanye
        </Link>
      </p>
    </div>
  )
}
