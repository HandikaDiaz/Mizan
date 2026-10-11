import type { ReactNode } from "react"

import { cn } from "@/src/lib/utils"

type SectionHeadProps = {
  overline: string
  title: ReactNode
  desc?: ReactNode
  action?: ReactNode
  align?: "start" | "between"
  id?: string
  className?: string
}

/**
 * Judul section. Satu bentuk untuk seluruh halaman supaya ritme tipografinya
 * konsisten (DESIGN.md §5). Overline selalu mono + huruf besar.
 */

export function SectionHead({
  overline,
  title,
  desc,
  action,
  align = "start",
  id,
  className,
}: SectionHeadProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "between" &&
          "sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="max-w-[46rem]">
        <p className="mz-overline">{overline}</p>
        <h2 id={id} className="mt-3 text-h1 text-balance text-ink">
          {title}
        </h2>
        {desc ? (
          <p className="mt-4 mz-prose text-ink-body">{desc}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
