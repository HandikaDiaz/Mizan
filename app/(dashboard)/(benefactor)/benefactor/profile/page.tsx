import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ExternalLink, Wallet } from "lucide-react"

import { CopyAddressButton } from "@/components/dashboard/copy-address-button"
import { PaymentHistory } from "@/components/dashboard/payment-history"
import { requireBenefactorUser } from "@/src/lib/benefactor/access"
import { EXPLORER_URL } from "@/src/lib/dashboard-data"
import { formatWeiBnb } from "@/src/lib/dashboard-server"
import { referralSourceOptions } from "@/src/lib/onboarding/profile-schema"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { db } from "@/src/prisma/db"

export const metadata: Metadata = {
  title: "Pengaturan — Dashboard Donatur",
}

export const dynamic = "force-dynamic"

const shorten = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function referralLabel(value: string | null | undefined) {
  if (!value) return "—"
  const match = referralSourceOptions.find((option) => option.value === value)
  return match?.label ?? value
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="border-b border-line-soft py-3 last:border-b-0 sm:grid sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium tracking-[0.04em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono text-sm break-all text-ink sm:mt-0"
            : "mt-1 text-sm text-ink sm:mt-0"
        }
      >
        {value || "—"}
      </dd>
    </div>
  )
}

export default async function BenefactorProfilePage() {
  const { user } = await requireBenefactorUser()

  const [wallets, payments] = await Promise.all([
    db.orm.public.UserWallet.where({ userId: user.id }).all(),
    db.orm.public.CampaignPayment.where({ donorId: user.id }).all(),
  ])

  const confirmed = payments.filter((payment) => payment.status === "CONFIRMED")
  const totalDonatedWei = confirmed
    .reduce((total, payment) => total + BigInt(payment.amountWei), BigInt(0))
    .toString()
  const campaignCount = new Set(confirmed.map((payment) => payment.campaignId))
    .size
  const onchainCount = confirmed.filter((payment) => payment.mode === "ONCHAIN")
    .length
  const mockCount = confirmed.filter((payment) => payment.mode === "MOCK").length

  const initials = (user.name || user.username || "D")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")

  return (
    <div className="mx-auto max-w-[840px]">
      <div>
        <p className="mz-overline">Donatur</p>
        <h1 className="mt-3 text-h1 text-ink">Pengaturan profil</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-body">
          Data akun, dompet, dan ringkasan dukungan sesuai schema User /
          UserWallet / CampaignPayment.
        </p>
        <p className="mt-2 text-xs text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Identitas */}
      <section className="mz-card mt-8 p-5 sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-soft-lavender text-lg font-bold text-primary-purple">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-h2 text-ink">{user.name || "Donatur Mizan"}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {user.username ? `@${user.username}` : "Username belum diisi"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-primary-purple px-3 text-[0.75rem] font-semibold tracking-[0.04em] text-white uppercase">
                Donatur
              </span>
              <span className="inline-flex h-7 items-center rounded-full bg-warm-yellow px-3 text-[0.75rem] font-semibold tracking-[0.04em] text-ink uppercase">
                Testnet
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-8 border-t border-line-soft pt-2">
          <Field label="Nama" value={user.name} />
          <Field label="Username" value={user.username ? `@${user.username}` : null} />
          <Field label="Email" value={user.email} />
          <Field label="Domisili" value={user.domicile} />
          <Field
            label="Role"
            value={
              <span className="font-medium text-primary-purple">
                {user.role}
                {user.userType ? ` · ${user.userType}` : ""}
              </span>
            }
          />
          <Field label="Privy ID" value={user.privyId} mono />
          <Field label="User ID" value={String(user.id)} mono />
        </dl>
      </section>

      {/* Kontak & preferensi onboarding */}
      <section className="mz-card mt-6 p-5 sm:p-8">
        <h2 className="text-h3 text-ink">Kontak & preferensi</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Diisi saat onboarding donatur. Tidak ditampilkan on-chain.
        </p>
        <dl className="mt-6 border-t border-line-soft pt-2">
          <Field label="WhatsApp" value={user.whatsappNumber} mono />
          <Field
            label="Notifikasi WA"
            value={user.whatsappNotificationConsent ? "Aktif" : "Tidak aktif"}
          />
          <Field
            label="Sumber info"
            value={
              user.referralSource === "OTHER" && user.referralSourceOther
                ? `${referralLabel(user.referralSource)} — ${user.referralSourceOther}`
                : referralLabel(user.referralSource)
            }
          />
          <Field
            label="Persetujuan data"
            value={
              user.dataConsent
                ? `Ya${user.dataConsentVersion ? ` · v${user.dataConsentVersion}` : ""}`
                : "Belum"
            }
          />
          <Field label="Consent pada" value={formatDate(user.dataConsentAt)} />
          <Field
            label="Onboarding selesai"
            value={formatDate(user.onboardingCompletedAt)}
          />
          <Field label="Dibuat" value={formatDate(user.createdAt)} />
          <Field label="Diperbarui" value={formatDate(user.updatedAt)} />
        </dl>
      </section>

      {/* Dompet */}
      <section className="mz-card mt-6 p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-h3 text-ink">Dompet terhubung</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Dari tabel UserWallet — dipakai untuk donasi MOCK dan ONCHAIN.
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-soft-lavender text-primary-purple">
            <Wallet className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
        </div>

        {wallets.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line-soft bg-very-light-purple px-4 py-5 text-sm text-ink-muted">
            Belum ada wallet tersinkron. Login ulang dengan Privy agar alamat
            Ethereum tercatat.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {wallets.map((wallet) => (
              <li
                key={wallet.id}
                className="rounded-[10px] bg-brand-950 p-4 text-brand-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm break-all sm:hidden">
                      {shorten(wallet.address)}
                    </p>
                    <p className="hidden font-mono text-sm break-all sm:block">
                      {wallet.address}
                    </p>
                    <p className="mt-2 text-xs text-brand-100/70">
                      {wallet.chainType} · {wallet.walletType}
                      {wallet.privyWalletId
                        ? ` · ${shorten(wallet.privyWalletId)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-warm-yellow px-2 py-1 text-[0.6875rem] font-semibold text-ink">
                      BSC Testnet
                    </span>
                    <CopyAddressButton address={wallet.address} />
                  </div>
                </div>
                <a
                  href={`${EXPLORER_URL}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-brand-200 hover:text-white"
                >
                  Lihat di BscScan
                  <ExternalLink
                    className="size-3.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ringkasan dukungan */}
      <section className="mz-card mt-6 p-5 sm:p-8">
        <h2 className="text-h3 text-ink">Ringkasan dukungan</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Dihitung dari CampaignPayment berstatus CONFIRMED milik akun ini.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total donasi",
              value: `${formatWeiBnb(totalDonatedWei).replace(".", ",")} BNB`,
            },
            {
              label: "Payment",
              value: String(confirmed.length),
            },
            {
              label: "Kampanye",
              value: String(campaignCount),
            },
            {
              label: "On-chain / Mock",
              value: `${onchainCount} / ${mockCount}`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-line-soft bg-very-light-purple px-4 py-4"
            >
              <p className="text-xs font-medium tracking-[0.04em] text-ink-muted uppercase">
                {stat.label}
              </p>
              <p className="mz-num mt-2 text-sm font-semibold text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat */}
      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-h3 text-ink">Riwayat donasi</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Payment MOCK dan ONCHAIN dari wallet yang login.
            </p>
          </div>
          <Link
            href="/benefactor/riwayat"
            className="text-sm font-semibold text-primary-purple hover:text-brand-violet"
          >
            Lihat semua
          </Link>
        </div>
        <PaymentHistory />
      </section>

      <p className="mt-8 text-xs text-ink-muted">
        Ingin mendukung kampanye?{" "}
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
