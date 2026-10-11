"use client"

import * as React from "react"
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  LifeBuoy,
  LockKeyhole,
  Search,
  WalletCards,
} from "lucide-react"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/site/language-provider"
import { FAQ } from "@/src/lib/site-data"

const TOPICS = [
  { id: "all", label: "Semua pertanyaan", icon: CircleHelp },
  { id: "general", label: "Penggunaan umum", icon: WalletCards },
  { id: "security", label: "Keamanan dana", icon: LockKeyhole },
  { id: "proof", label: "Bukti & transparansi", icon: FileCheck2 },
  { id: "support", label: "Bantuan lainnya", icon: LifeBuoy },
] as const

function topicFor(index: number): (typeof TOPICS)[number]["id"] {
  if (index === 0 || index === 3) return "general"
  if (index === 1) return "security"
  if (index === 2 || index === 4) return "proof"
  return "support"
}

export function Faq() {
  const { t } = useLanguage()
  const [query, setQuery] = React.useState("")
  const [activeTopic, setActiveTopic] = React.useState("all")
  const [submittedQuery, setSubmittedQuery] = React.useState("")

  const filteredFaq = React.useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toLocaleLowerCase("id-ID")

    return FAQ.map((item, index) => ({ item, index }))
      .filter(({ index }) => {
        return activeTopic === "all" || topicFor(index) === activeTopic
      })
      .filter(({ item }) => {
        if (!normalizedQuery) return true
        return `${item.q} ${item.a}`
          .toLocaleLowerCase("id-ID")
          .includes(normalizedQuery)
      })
  }, [activeTopic, submittedQuery])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedQuery(query)
  }

  return (
    <section
      id="tanya-jawab"
      className="mz-section scroll-mt-24 bg-very-light-purple"
      aria-labelledby="faq-title"
    >
      <div className="mz-container">
        <div className="overflow-hidden rounded-[2rem] border border-line-soft bg-surface px-6 py-12 text-center shadow-sm sm:px-10 lg:px-16 lg:py-16">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-soft-lavender px-3 py-1 text-xs font-semibold tracking-[0.08em] text-primary-purple">
            {t("TANYA JAWAB")}
          </span>
          <h2
            id="faq-title"
            className="mx-auto mt-5 max-w-3xl text-h1 text-balance text-ink"
          >
            {t("Jawaban untuk hal yang paling penting.")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-ink-muted">
            {t(
              "Cari tahu bagaimana dana dijaga, dicatat, dan bisa kamu periksa sendiri sebelum mulai berdonasi."
            )}
          </p>

          <form
            className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={handleSearch}
          >
            <label className="relative flex-1 text-left">
              <span className="sr-only">{t("Cari pertanyaan")}</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Cari pertanyaan...")}
                aria-label={t("Cari pertanyaan")}
                className="pl-10"
              />
            </label>
            <Button type="submit" size="lg" className="h-11 px-5">
              {t("Cari")}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </form>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-2xl border border-line-soft bg-surface p-3 shadow-xs">
            <p className="px-3 pt-1 pb-2 text-label tracking-[0.08em] text-ink-muted uppercase">
              {t("Topik bantuan")}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {TOPICS.map((topic) => {
                const Icon = topic.icon
                const isActive = activeTopic === topic.id

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopic(topic.id)}
                    aria-pressed={isActive}
                    className={[
                      "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-purple lg:w-full",
                      isActive
                        ? "bg-primary-purple text-white"
                        : "text-ink-body hover:bg-soft-lavender hover:text-primary-purple",
                    ].join(" ")}
                  >
                    <Icon
                      className="size-4"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>{t(topic.label)}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="rounded-2xl border border-line-soft bg-surface px-5 shadow-xs sm:px-7">
            <div className="flex items-center justify-between gap-4 border-b border-line-soft py-5">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {t("Pertanyaan umum")}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {filteredFaq.length} {t("jawaban tersedia")}
                </p>
              </div>
              <CircleHelp
                className="size-5 text-brand-violet"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            {filteredFaq.length > 0 ? (
              <Accordion
                key={`${activeTopic}-${submittedQuery}`}
                multiple
                defaultValue={["faq-0"]}
                className="divide-y-0"
              >
                {filteredFaq.map(({ item, index }) => (
                  <AccordionItem key={item.q} value={`faq-${index}`}>
                    <AccordionHeader>
                      <AccordionTrigger>
                        <span>{t(item.q)}</span>
                        <ChevronDown
                          className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-[open]:rotate-180"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionPanel>
                      <p className="pr-8 pb-5">{t(item.a)}</p>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-16 text-center">
                <Search
                  className="mx-auto size-6 text-brand-violet"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-ink">
                  {t("Belum ada jawaban yang cocok.")}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {t(
                    "Coba kata kunci lain atau pilih topik bantuan yang berbeda."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
