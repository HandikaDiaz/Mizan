"use client"

import * as React from "react"
import { useIdentityToken } from "@privy-io/react-auth"
import { ArrowUpRight } from "lucide-react"
import { EXPLORER_URL } from "@/src/lib/dashboard-data"
import { useLanguage } from "@/components/site/language-provider"

type PaymentRow = {
  id: number
  campaignTitle: string
  amountWei: string
  mode: "MOCK" | "ONCHAIN"
  status: "PENDING" | "CONFIRMED" | "FAILED"
  transactionHash: string | null
  createdAt: string
}

function formatWei(value: string) {
  const wei = BigInt(value || "0")
  const whole = wei / BigInt("1000000000000000000")
  const fraction = (wei % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export function PaymentHistory() {
  const { identityToken } = useIdentityToken()
  const { language, t } = useLanguage()
  const [payments, setPayments] = React.useState<PaymentRow[]>([])
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    if (!identityToken) {
      return
    }

    let cancelled = false
    fetch("/api/payments/history", {
      headers: { "privy-id-token": identityToken },
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          payments?: PaymentRow[]
          error?: string
        }
        if (!response.ok)
          throw new Error(body.error || "Riwayat payment gagal dimuat")
        if (!cancelled) {
          setPayments(body.payments ?? [])
          setMessage(
            body.payments?.length ? "" : "Belum ada payment dari wallet ini."
          )
        }
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setMessage(
            error instanceof Error
              ? error.message
              : "Riwayat payment gagal dimuat"
          )
      })

    return () => {
      cancelled = true
    }
  }, [identityToken])

  return (
    <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
      {payments.length === 0 ? (
        <p className="text-sm text-ink-muted">
          {message
            ? t(message)
            : identityToken
              ? t("Memuat riwayat payment...")
              : t("Login diperlukan untuk melihat riwayat wallet ini.")}
        </p>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center gap-4 border-b border-line-soft py-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">
                {payment.campaignTitle}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {payment.mode} · {payment.status} ·{" "}
                {new Date(payment.createdAt).toLocaleString(
                  language === "en" ? "en-US" : "id-ID"
                )}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm text-ink tabular-nums">
              {formatWei(payment.amountWei)}{" "}
              <span className="text-xs text-ink-muted">BNB</span>
            </p>
            {payment.transactionHash ? (
              <a
                href={`${EXPLORER_URL}/tx/${payment.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 dark:text-brand-300"
                aria-label={t("Buka transaction hash")}
              >
                <ArrowUpRight
                  className="size-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}
