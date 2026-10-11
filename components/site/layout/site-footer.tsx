"use client"

import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/site/language-provider"
import { NAV, SITE, TESTNET_NOTICE } from "@/src/lib/site-data"

const SUMBER: { label: string; href: string; external?: boolean }[] = [
  {
    label: "Kontrak di BscScan",
    href: `${SITE.explorer}/address/${SITE.contract}`,
    external: true,
  },
  { label: "Dokumentasi kontrak", href: "#cara-kerja" },
  { label: "Tanya jawab", href: "#tanya-jawab" },
]

export function SiteFooter() {
  const tahun = new Date().getFullYear()
  const { t } = useLanguage()

  return (
    <footer className="bg-very-light-purple px-3 pt-3 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-line-soft bg-soft-lavender px-6 py-12 shadow-sm sm:px-10 lg:px-14 lg:py-14">
          <span
            className="pointer-events-none absolute top-0 -right-3 text-[clamp(8rem,24vw,18rem)] leading-[0.8] font-black tracking-[-0.09em] text-primary-purple/[0.055] select-none"
            aria-hidden="true"
          >
            Mizan
          </span>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.45fr_0.8fr_0.95fr_1.25fr] lg:gap-8">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary-purple"
                aria-label={t("Mizan — kembali ke beranda")}
              >
                <Image
                  src="/Favicon.png"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                />
                <span className="text-xl font-extrabold tracking-[-0.04em]">
                  Mizan
                </span>
              </Link>
              <p className="mt-5 max-w-[34ch] text-sm leading-7 text-ink-muted">
                {t(
                  "Platform zakat dan donasi yang menaruh dana di kontrak pintar, bukan di rekening pengelola. Setiap pencairan tercatat dan bisa diperiksa siapa pun."
                )}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-surface px-3 py-1.5 text-xs font-medium text-primary-purple">
                <ShieldCheck
                  className="size-3.5"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {t("Jejak dana dapat diaudit")}
              </div>
            </div>

            <nav aria-label="Navigasi footer">
              <h2 className="text-sm font-semibold text-ink">
                {t("Jelajahi")}
              </h2>
              <ul className="mt-4 flex flex-col gap-1">
                {NAV.slice(0, 3).map(
                  (item: { href: string; label: string }) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="inline-flex min-h-9 items-center text-sm text-ink-muted transition-colors hover:text-primary-purple"
                      >
                        {t(item.label)}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>

            <nav aria-label="Sumber dan bantuan">
              <h2 className="text-sm font-semibold text-ink">{t("Bantuan")}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                {[
                  { label: "Transparansi", href: "#cara-kerja" },
                  { label: "Tanya jawab", href: "#tanya-jawab" },
                  { label: "Kampanye", href: "#kampanye" },
                  ...SUMBER.slice(0, 1),
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex min-h-9 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-primary-purple"
                    >
                      {t(item.label)}
                      {item.external ? (
                        <ExternalLink
                          className="size-3.5"
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                {t("Tetap terhubung")}
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                {t(
                  "Dapatkan kabar terbaru tentang kampanye dan transparansi Mizan."
                )}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-line-ui bg-surface p-1.5 shadow-xs">
                <Input
                  type="email"
                  placeholder={t("Email kamu...")}
                  aria-label={t("Email kamu")}
                  className="h-9 border-0 bg-transparent px-2.5 shadow-none focus:border-0 focus:ring-0"
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label={t("Daftar informasi Mizan")}
                  className="size-9 rounded-lg"
                >
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-muted">
                {t(
                  "Tidak ada spam. Hanya kabar penting tentang dana dan penerima."
                )}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex flex-col gap-4 border-t border-primary-purple/15 pt-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="mr-2 inline-flex rounded-full bg-warm-yellow/25 px-2 py-1 font-semibold text-accent-text">
                TESTNET
              </span>
              {t(TESTNET_NOTICE)}
            </p>
            <p className="mz-num">
              Chain ID {SITE.chainId} · {SITE.contractShort} · © {tahun} Mizan
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
