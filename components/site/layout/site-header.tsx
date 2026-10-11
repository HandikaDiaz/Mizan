"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

import { mzBtn } from "@/components/site/ui/mz-button"
import { AuthMenu } from "@/components/auth/auth-menu"
import { useLanguage } from "@/components/site/language-provider"
import { NAV } from "@/src/lib/site-data"

export function SiteHeader() {
  const [buka, setBuka] = React.useState(false)
  const { t } = useLanguage()
  const panelId = "mz-nav-seluler"

  return (
    <header className="mz-site-header sticky top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-soft-lavender bg-surface px-3 py-2 shadow-sm sm:rounded-full sm:px-4 lg:min-h-[72px] lg:px-7">
          <Link
            href="/"
            className="mz-site-wordmark flex min-h-11 shrink-0 items-center"
            aria-label={t("Mizan — kembali ke beranda")}
          >
            <span data-mz-logo-anchor className="mz-site-logo">
              <Image
                src="/Primary-Logo.png"
                alt="Mizan"
                className="mz-site-logo__image bg-transparent"
                width={1200}
                height={400}
                sizes="162px"
              />
            </span>
          </Link>

          <nav className="hidden lg:block" aria-label={t("Navigasi utama")}>
            <ul className="flex items-center gap-1">
              {NAV.map((item: { href: string; label: string }) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-ink-body transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                  >
                    {t(item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:flex">
              <AuthMenu />
            </div>

            <button
              type="button"
              onClick={() => setBuka((v) => !v)}
              className={mzBtn("ghost", "sm", "h-11 w-11 px-0 lg:hidden")}
              aria-expanded={buka}
              aria-controls={panelId}
              aria-label={t(buka ? "Tutup menu" : "Buka menu")}
            >
              {buka ? (
                <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {buka ? (
          <div
            id={panelId}
            className="mt-3 rounded-3xl border border-soft-lavender bg-surface p-2 shadow-sm lg:hidden"
          >
            <nav className="px-2 py-3" aria-label={t("Navigasi seluler")}>
              <ul className="flex flex-col">
                {NAV.map((item: { href: string; label: string }) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => setBuka(false)}
                      className="block rounded-md px-3 py-3 text-[0.9375rem] font-medium text-ink-body transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                    >
                      {t(item.label)}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-3 sm:hidden">
                <AuthMenu mobile />
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  )
}
