import * as React from "react"

import { cn } from "@/src/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-line-ui bg-surface px-3.5 py-2 text-sm text-ink shadow-xs outline-none transition-colors placeholder:text-ink-muted focus:border-primary-purple focus:ring-3 focus:ring-primary-purple/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
