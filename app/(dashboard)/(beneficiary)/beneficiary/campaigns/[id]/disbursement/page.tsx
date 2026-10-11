import Link from "next/link"
import { ChevronLeft, ArrowUpRight } from "lucide-react"
import { notFound } from "next/navigation"
import { getMilestones } from "../milestones/actions"
import { LocalizedText } from "@/components/dashboard/localized-text"
import { getContractUrl, getExplorerUrl } from "@/src/lib/chain/explorer"
import {
  isMilestoneReadyForDisbursement,
  isMilestoneVisibleOnDisbursementPage,
} from "@/src/lib/disbursement-presentation"

export default async function DisbursementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMilestones(id)
  if (!result) notFound()

  const visibleMilestones = result.milestones.filter(
    (m) =>
      isMilestoneVisibleOnDisbursementPage(m.status, Boolean(m.lockedAt)),
  )
  const eligible = visibleMilestones.filter((m) =>
    isMilestoneReadyForDisbursement(m.status),
  )

  const totalDisbursedWei = result.milestones
    .filter((m) => m.status === "DISBURSED")
    .reduce((sum, m) => sum + BigInt(m.amountWei || "0"), BigInt(0))

  const totalEligibleWei = eligible.reduce(
    (sum, m) => sum + BigInt(m.amountWei || "0"),
    BigInt(0)
  )

  return (
    <div className="mx-auto max-w-[840px]">
      <Link
        href={`/beneficiary/campaigns/${id}`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        Kembali ke kampanye
      </Link>

      <p className="mz-overline">
        <LocalizedText text="Penyaluran" />
      </p>
      <h1 className="mt-2 text-h1 text-ink">
        <LocalizedText text="Ajukan pencairan" />
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        Nominal pengajuan selalu dikunci sama dengan nominal milestone. Setelah
        admin menyetujui, pencairan diproses melalui smart contract.
      </p>

      <div className="mt-5 rounded-xl border border-line-soft bg-surface p-4 text-sm">
        <p className="font-semibold text-ink">Status smart contract</p>
        <p className="mt-1 text-ink-muted">
          {result.campaign.onchainStatus ?? "NOT_REGISTERED"} · BSC Testnet
          {result.campaign.chainId ? ` (${result.campaign.chainId})` : ""}
        </p>
        {result.campaign.contractAddress ? (
          <a
            href={getContractUrl(result.campaign.contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-brand-700 hover:underline"
          >
            {result.campaign.contractAddress.slice(0, 10)}…
            {result.campaign.contractAddress.slice(-8)}
            <ArrowUpRight size={12} strokeWidth={1.5} />
          </a>
        ) : null}
        {result.campaign.onchainRegistrationError ? (
          <p className="mt-2 text-xs text-coral">
            {result.campaign.onchainRegistrationError}
          </p>
        ) : null}
        {result.chainSummary ? (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line-soft pt-3 sm:grid-cols-4">
            {[
              ["Funded", result.chainSummary.fundedAmountWei],
              ["Reserved", result.chainSummary.reservedAmountWei],
              ["Released", result.chainSummary.releasedAmountWei],
              ["Available", result.chainSummary.availableAmountWei],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-ink-muted">{label}</p>
                <p className="mt-1 font-mono text-xs font-semibold text-ink">
                  {formatWei(value)} {result.campaign.currency}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-line-soft bg-surface p-4">
          <p className="text-xs text-ink-muted">
            <LocalizedText text="Total eligible" />
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-ink tabular-nums">
            {formatWei(totalEligibleWei.toString())}{" "}
            <span className="text-sm font-normal text-ink-muted">
              {result.campaign.currency}
            </span>
          </p>
        </div>
        <div className="rounded-[10px] border border-line-soft bg-surface p-4">
          <p className="text-xs text-ink-muted">
            <LocalizedText text="Sudah dicairkan" />
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-brand-700 tabular-nums">
            {formatWei(totalDisbursedWei.toString())}{" "}
            <span className="text-sm font-normal text-ink-muted">
              {result.campaign.currency}
            </span>
          </p>
        </div>
      </div>

      {/* Milestone list */}
      <div className="mt-8 space-y-3">
        {visibleMilestones.map((milestone) => (
          <div
            key={milestone.id}
            className="mz-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-xs text-brand-700">
                  {milestone.order}
                </span>
                <h2 className="font-semibold text-ink">
                  {milestone.description}
                </h2>
              </div>
              <p className="mt-1 font-mono text-sm text-ink-muted">
                {formatWei(milestone.amountWei)} {result.campaign.currency}
              </p>

              {/* Disbursement timestamp */}
              {milestone.disbursementRequestedAt && (
                <p className="mt-2 text-xs text-ink-muted">
                  Diajukan:{" "}
                  {new Date(
                    milestone.disbursementRequestedAt
                  ).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {/* TX hash link */}
              {(milestone.disbursementRequest?.transactionHash || milestone.disbursementTxHash) && (
                <a
                  href={getExplorerUrl(milestone.disbursementRequest?.transactionHash || milestone.disbursementTxHash || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-brand-700 hover:underline"
                >
                  {(milestone.disbursementRequest?.transactionHash || milestone.disbursementTxHash || "").slice(0, 10)}…
                  {(milestone.disbursementRequest?.transactionHash || milestone.disbursementTxHash || "").slice(-6)}
                  <ArrowUpRight size={12} strokeWidth={1.5} />
                </a>
              )}
            </div>

            <div className="shrink-0">
              {milestone.lockedAt && ["PENDING", "AI_VERIFIED", "MANUAL_REVIEW"].includes(milestone.status) ? (
                <Link
                  href={`/beneficiary/campaigns/${id}/milestones/${milestone.id}/proof`}
                  className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  {milestone.status === "PENDING" ? "Kirim bukti" : "Lihat bukti / pencairan"}
                </Link>
              ) : (
                <span
                  className={`inline-flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-semibold tracking-[0.02em] uppercase ${
                    milestone.status === "DISBURSED" || milestone.disbursementRequest?.status === "DISBURSED"
                      ? "bg-brand-50 text-brand-700"
                      : milestone.status === "CHAIN_FAILED" || milestone.disbursementRequest?.status === "CHAIN_FAILED"
                        ? "bg-coral/10 text-coral"
                      : "bg-accent-200/20 text-ink"
                  }`}
                >
                  {disbursementStatusLabel(milestone.status, milestone.disbursementRequest?.status)}
                </span>
              )}
              {milestone.disbursementRequest?.chainError ? (
                <p className="mt-2 max-w-xs text-right text-xs text-coral">
                  {milestone.disbursementRequest.chainError}
                </p>
              ) : null}
            </div>
          </div>
        ))}

        {visibleMilestones.length === 0 && (
          <div className="mz-card p-8 text-center text-sm text-ink-muted">
            Belum ada milestone yang siap diajukan. Verifikasi bukti penyaluran
            melalui halaman milestone terlebih dahulu.
          </div>
        )}
      </div>
    </div>
  )
}

function disbursementStatusLabel(status: string, requestStatus?: string) {
  const current = requestStatus || status
  const labels: Record<string, string> = {
    PENDING: "Menunggu bukti penyaluran",
    AI_VERIFIED: "Siap diajukan",
    MANUAL_REVIEW: "Menunggu review manual",
    ADMIN_APPROVED: "Disetujui admin",
    CHAIN_PENDING: "Menunggu konfirmasi chain",
    CHAIN_FAILED: "Chain gagal — perlu retry",
    DISBURSED: "Dana cair",
  }
  return labels[current] || "Menunggu pencairan"
}

function formatWei(value: string) {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}
