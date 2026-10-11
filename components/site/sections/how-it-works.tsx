import { STEPS } from "@/src/lib/site-data"
import { SectionHead } from "../ui/section-head"

/**
 * Cara kerja. Timeline vertikal dengan garis penghubung, bukan tiga kartu
 * ikon sejajar — karena ini urutan, dan urutan lebih jelas dibaca menurun.
 */

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="mz-section">
      <div className="mz-container">
        <SectionHead
          overline="Cara kerja"
          title="Tiga langkah, dan tidak ada yang disembunyikan"
          desc="Tidak ada pendaftaran, tidak ada unggah dokumen pribadi. Yang perlu kamu tahu cuma ke mana dananya pergi."
        />

        <ol className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex gap-5 lg:block">
              {/* Rel vertikal (seluler) */}
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[19px] top-11 -bottom-10 w-px bg-line-soft lg:hidden"
                />
              ) : null}

              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
                <span className="mz-num text-xs font-semibold text-brand-700 dark:text-brand-300">
                  {s.n}
                </span>
              </div>

              <div className="lg:mt-6">
                {/* Rel horizontal (desktop) */}
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[calc(33.333%+2.75rem)] right-0 top-5 hidden h-px bg-line-soft lg:block"
                  />
                ) : null}
                <h3 className="text-h3 text-ink">{s.title}</h3>
                <p className="mt-3 mz-prose text-sm text-ink-body">{s.body}</p>
                <p className="mt-4 border-l-2 border-brand-200 pl-3 mz-num text-xs text-ink-muted dark:border-brand-900">
                  {s.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
