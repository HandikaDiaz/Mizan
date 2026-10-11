"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

export function CopyAddressButton({
  address,
  label = "Salin alamat",
}: {
  address: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex size-8 items-center justify-center rounded-md text-brand-100/80 transition-colors hover:bg-white/10 hover:text-white"
      aria-label={label}
    >
      {copied ? (
        <Check className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  )
}
