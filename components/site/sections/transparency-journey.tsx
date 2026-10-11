"use client"

import * as React from "react"
import {
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Wallet,
} from "lucide-react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { useLanguage } from "@/components/site/language-provider"
import { STEPS, FUND_FLOW, SITE } from "@/src/lib/site-data"

type JourneyDetail = {
  label: string
  value: string
}

type JourneyStep = {
  n: string
  phase: string
  title: string
  body: string
  note: string
  icon: LucideIcon
  details: JourneyDetail[]
  href?: string
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    n: "01",
    phase: "Mulai dari sini",
    title: STEPS[0].title,
    body: STEPS[0].body,
    note: STEPS[0].note,
    icon: Wallet,
    details: [
      { label: "Yang dibutuhkan", value: "Dompet BNB Smart Chain" },
      { label: "Data pribadi", value: "Tidak ada pendaftaran" },
    ],
  },
  {
    n: "02",
    phase: "Transaksi pertama",
    title: "Donasi masuk ke kontrak",
    body: "Dana tidak masuk ke rekening pengelola. Donasi langsung dikirim ke kontrak pintar yang alamatnya terbuka untuk diperiksa.",
    note: "Setiap kiriman meninggalkan transaksi yang bisa ditelusuri.",
    icon: ArrowRight,
    details: [
      { label: "Pengirim", value: FUND_FLOW[0].address },
      {
        label: "Nilai demo",
        value: FUND_FLOW[0].action.replace("Mengirim ", ""),
      },
    ],
  },
  {
    n: "03",
    phase: "Tercatat on-chain",
    title: "Kontrak mencatat niat",
    body: "Kontrak menahan dana dan mencatat tujuan donasi. Tidak ada pihak yang bisa memindahkan dana secara sepihak.",
    note: "Alamat kontrak dan blok transaksi tersedia untuk audit publik.",
    icon: LockKeyhole,
    details: [
      { label: "Kontrak", value: SITE.contractShort },
      { label: "Blok demo", value: FUND_FLOW[1].block },
    ],
  },
  {
    n: "04",
    phase: "Sebelum dana cair",
    title: "Bukti penyaluran diverifikasi",
    body: STEPS[2].body,
    note: "Pencairan tertahan sampai bukti dan milestone terpenuhi.",
    icon: FileCheck2,
    details: [
      { label: "Status", value: "Menunggu bukti" },
      { label: "Aturan", value: "Milestone wajib lolos" },
    ],
  },
  {
    n: "05",
    phase: "Selesai disalurkan",
    title: "Dana sampai ke penerima",
    body: FUND_FLOW[2].action,
    note: "Hash transaksi tujuan bisa dibuka siapa pun di explorer.",
    icon: Check,
    details: [
      { label: "Penerima", value: FUND_FLOW[2].address },
      { label: "Blok demo", value: FUND_FLOW[2].block },
    ],
    href: `${SITE.explorer}/tx/${FUND_FLOW[2].hash}`,
  },
]

export function TransparencyJourney() {
  const { t } = useLanguage()
  const sectionRef = React.useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = React.useState(0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.25,
  })
  const stepProgress = useTransform(
    smoothProgress,
    [0, 1],
    [0, JOURNEY_STEPS.length - 1]
  )

  useMotionValueEvent(stepProgress, "change", (latest) => {
    const nextStep = Math.max(
      0,
      Math.min(JOURNEY_STEPS.length - 1, Math.round(latest))
    )

    setActiveStep((current) => (current === nextStep ? current : nextStep))
  })

  const currentStep = JOURNEY_STEPS[activeStep]

  return (
    <section
      ref={sectionRef}
      id="cara-kerja"
      className="mz-journey"
      style={{ height: `${JOURNEY_STEPS.length * 100}svh` }}
    >
      <span id="alur-dana" className="absolute -top-24" aria-hidden="true" />

      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden">
        <motion.div
          className="mz-journey__glow"
          animate={{
            x: `${activeStep * 9}%`,
            y: `${activeStep * -4}%`,
            scale: 1 + activeStep * 0.04,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
        <div className="mz-journey__grid" aria-hidden="true" />

        <div className="mz-container relative z-10 py-16 sm:py-24 lg:py-28">
          <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
            <div>
              <p className="mz-overline">{t("Cara kerja + transparansi")}</p>
              <h2 className="mt-4 max-w-[15ch] text-h1 text-balance text-ink">
                {t("Dari dompet sampai penerima, setiap langkah punya jejak.")}
              </h2>
              <p className="mt-5 max-w-[42ch] text-base leading-7 text-ink-body sm:text-lg">
                {t(
                  "Ikuti perjalanan satu donasi. Gulir perlahan untuk melihat apa yang terjadi pada dana kamu di setiap tahap."
                )}
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs text-ink-muted sm:mt-8">
                <span className="mz-journey__scroll-dot" aria-hidden="true" />
                <span>{t("Scroll untuk menjelajah")}</span>
                <span className="mz-num ml-auto text-primary-purple">
                  {currentStep.n} /{" "}
                  {JOURNEY_STEPS.length.toString().padStart(2, "0")}
                </span>
              </div>

              <ol className="mt-10 hidden space-y-3 lg:block">
                {JOURNEY_STEPS.map((step, index) => {
                  const isActive = index === activeStep
                  const isComplete = index < activeStep

                  return (
                    <li
                      key={step.n}
                      className="relative min-w-[8.75rem] lg:min-w-0"
                      aria-current={isActive ? "step" : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            isActive
                              ? "mz-journey__step-marker mz-journey__step-marker--active"
                              : isComplete
                                ? "mz-journey__step-marker mz-journey__step-marker--complete"
                                : "mz-journey__step-marker"
                          }
                        >
                          {isComplete ? (
                            <Check
                              className="size-4"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="mz-num text-xs">{step.n}</span>
                          )}
                        </span>
                        <span>
                          <span className="block text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                            {t(step.phase)}
                          </span>
                          <span
                            className={
                              isActive
                                ? "mt-0.5 block text-sm font-semibold text-primary-purple"
                                : "mt-0.5 block text-sm text-ink-muted"
                            }
                          >
                            {t(step.title)}
                          </span>
                        </span>
                      </div>
                      {index < JOURNEY_STEPS.length - 1 ? (
                        <span
                          className="absolute top-10 left-5 hidden h-3 w-px bg-line-soft lg:block"
                          aria-hidden="true"
                        />
                      ) : null}
                    </li>
                  )
                })}
              </ol>

              <div
                className="mt-6 flex items-center gap-1.5 sm:mt-8 lg:hidden"
                aria-label="Progress langkah"
              >
                {JOURNEY_STEPS.map((step, index) => (
                  <span
                    key={step.n}
                    className={
                      index === activeStep
                        ? "h-1.5 w-8 rounded-full bg-primary-purple"
                        : index < activeStep
                          ? "h-1.5 w-3 rounded-full bg-brand-violet"
                          : "h-1.5 w-3 rounded-full bg-line-soft"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="relative min-h-[22rem] sm:min-h-[27rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={currentStep.n}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.98 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className="mz-journey-card"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft-lavender text-primary-purple">
                      <currentStep.icon
                        className="size-6"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="mz-num rounded-full bg-very-light-purple px-3 py-1.5 text-xs font-semibold text-primary-purple">
                      {t("Langkah")} {currentStep.n}
                    </span>
                  </div>

                  <p className="mz-overline mt-5 sm:mt-8">
                    {t(currentStep.phase)}
                  </p>
                  <h3 className="mt-2 max-w-[16ch] text-h2 text-ink">
                    {t(currentStep.title)}
                  </h3>
                  <p className="mt-3 max-w-[48ch] text-base leading-7 text-ink-body sm:mt-4">
                    {t(currentStep.body)}
                  </p>
                  <p className="mt-4 border-l-2 border-primary-purple/35 pl-3 text-sm font-medium text-primary-purple sm:mt-5">
                    {t(currentStep.note)}
                  </p>

                  <dl className="mt-5 grid gap-3 border-t border-line-soft pt-5 sm:mt-8 sm:grid-cols-2">
                    {currentStep.details.map((detail) => (
                      <div key={detail.label}>
                        <dt className="text-xs text-ink-muted">
                          {t(detail.label)}
                        </dt>
                        <dd className="mt-1 font-medium text-ink">
                          {t(detail.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {currentStep.href ? (
                    <a
                      href={currentStep.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-purple transition-colors hover:text-brand-violet sm:mt-7"
                    >
                      {t("Buka contoh transaksi")}
                      <ExternalLink
                        className="size-4"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </a>
                  ) : null}
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
