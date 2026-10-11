"use client"

import { ArrowRight, Lock, ShieldCheck, Wallet } from "lucide-react"
import Image from "next/image"

import { useLanguage } from "@/components/site/language-provider"
import { mzBtn } from "@/components/site/ui/mz-button"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="mz-hero">
      <div className="mz-hero__media" aria-hidden="true">
        <Image
          src="/background-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="mz-hero__wash" />
      </div>

      <div className="mz-container relative flex min-h-[650px] items-center py-14 sm:min-h-[700px] sm:py-20 lg:min-h-[720px] lg:py-24">
        <div className="relative z-10 max-w-[38rem] lg:pl-8">
          <p className="mz-overline inline-flex rounded-full bg-surface/90 px-3 py-1.5 shadow-xs">
            {t("Zakat & donasi on-chain")}
          </p>

          <h1 className="mt-5 max-w-[11ch] text-display text-balance text-ink">
            {t("Setiap dana punya")}{" "}
            <span className="text-primary-purple">{t("jejaknya.")}</span>
          </h1>

          <p className="mz-prose mt-6 max-w-[34rem] border-l-2 border-primary-purple/40 pl-4 text-body-lg text-ink-body sm:pl-5">
            {t(
              "Donasi masuk ke kontrak pintar di BNB Smart Chain, bukan ke rekening kami. Setiap pencairan ke penerima tercatat di blockchain dan bisa kamu periksa sendiri — kapan saja, tanpa perlu izin siapa pun."
            )}
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <a href="#kampanye" className={mzBtn("accent", "lg")}>
              {t("Donasi Sekarang")}
              <ArrowRight
                className="size-5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
            <a href="#cara-kerja" className={mzBtn("outline", "lg")}>
              {t("Lihat Alur Dana")}
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 rounded-2xl bg-surface/80 px-4 py-3 shadow-xs backdrop-blur-sm sm:mt-8 sm:gap-x-7">
            {[
              { icon: ShieldCheck, text: t("Data uji testnet") },
              { icon: Lock, text: t("Dana ditahan kontrak") },
              { icon: Wallet, text: t("Tanpa perantara") },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="mz-num flex items-center gap-2 text-xs text-ink-muted"
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
