import { SiteHeader } from "@/components/site/layout/site-header"
import { SectionHead } from "@/components/site/ui/section-head"

/**
 * Route-level loading UI (Next.js streaming). Skeleton mirrors the card grid so
 * the layout doesn't shift when data arrives. Pulse is a functional loading
 * affordance, not decorative motion.
 */
export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="mz-section bg-surface-sunken">
        <div className="mz-container">
          <SectionHead
            overline="Kampanye"
            title="Kampanye yang sedang berjalan"
            desc="Pilih kampanye yang ingin kamu dukung. Setiap pencairan tercatat di kontrak publik dan dapat diperiksa siapa pun."
          />

          {/* Controls skeleton */}
          <div className="mt-8 flex flex-col gap-4" aria-hidden="true">
            <div className="h-12 max-w-xl animate-pulse rounded-sm bg-soft-lavender" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-9 w-24 animate-pulse rounded-full bg-soft-lavender"
                />
              ))}
            </div>
          </div>

          {/* Card grid skeleton */}
          <div
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="mz-card flex flex-col overflow-hidden p-0"
              >
                <div className="aspect-[16/9] animate-pulse bg-soft-lavender" />
                <div className="flex flex-col gap-4 p-6">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-soft-lavender" />
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-soft-lavender" />
                  <div className="h-4 w-full animate-pulse rounded-md bg-soft-lavender" />
                  <div className="h-2 w-full animate-pulse rounded-full bg-soft-lavender" />
                  <div className="mt-2 h-9 w-full animate-pulse rounded-md bg-soft-lavender" />
                </div>
              </div>
            ))}
          </div>

          <span className="sr-only" role="status">
            Memuat kampanye…
          </span>
        </div>
      </main>
    </>
  )
}
