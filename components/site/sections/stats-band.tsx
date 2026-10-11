import { STATS, STATS_FOOTNOTE } from "@/src/lib/site-data"

/**
 * Band statistik. Angka statis, tanpa animasi hitung-naik — animasi semacam
 * itu menarik perhatian ke gerakannya, bukan ke angkanya.
 */

export function StatsBand() {
  return (
    <section className="bg-brand-700" aria-labelledby="mz-statistik">
      <div className="mz-container py-16 sm:py-20">
        <h2
          id="mz-statistik"
          className="mz-overline text-brand-200"
        >
          Sejauh mana
        </h2>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-t border-white/25 pt-5">
              <dt className="text-sm text-brand-100">{s.label}</dt>
              <dd className="mt-2">
                <span className="mz-num block text-h1 text-white">
                  {s.value}
                </span>
                <span className="mz-num mt-1 block text-xs text-brand-200">
                  {s.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 max-w-[60ch] text-sm text-brand-100">
          {STATS_FOOTNOTE}
        </p>
      </div>
    </section>
  )
}
