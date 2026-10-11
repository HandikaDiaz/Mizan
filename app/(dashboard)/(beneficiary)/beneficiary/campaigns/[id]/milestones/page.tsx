import {
  ArrowDownToLine,
  CheckCircle,
  ChevronLeft,
  CircleCheck,
  CircleDot,
  Clock,
  FileText,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getMilestones } from "./actions"
import {
  MilestoneControls,
  NewMilestoneForm,
} from "./milestone-management"
import { LocalizedText } from "@/components/dashboard/localized-text"

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Belum Dimulai",
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    icon: CircleDot,
  },
  PROOF_SUBMITTED: {
    label: "Menunggu Verifikasi",
    bg: "bg-accent-200/20",
    text: "text-ink",
    icon: Clock,
  },
  AI_VERIFIED: {
    label: "Terverifikasi",
    bg: "bg-brand-50",
    text: "text-brand-700",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Perlu Bukti Ulang",
    bg: "bg-coral/10",
    text: "text-coral",
    icon: XCircle,
  },
  DISBURSEMENT_REQUESTED: {
    label: "Menunggu Pencairan",
    bg: "bg-accent-200/20",
    text: "text-ink",
    icon: ArrowDownToLine,
  },
  DISBURSED: {
    label: "Dana Cair",
    bg: "bg-brand-50",
    text: "text-brand-700",
    icon: CircleCheck,
  },
}

export default async function MilestonesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMilestones(id)
  if (!result) notFound()

  return (
    <div className="mx-auto max-w-[840px]">
      <Link
        href={`/beneficiary/campaigns/${id}`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        Kembali ke kampanye
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mz-overline">
            <LocalizedText text="Penyaluran" />
          </p>
          <h1 className="mt-2 text-h1 text-ink">
            <LocalizedText text="Kelola milestone" />
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{result.campaign.title}</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: result.milestones.length,
          },
          {
            label: "Terverifikasi",
            value: result.milestones.filter(
              (m) =>
                m.status === "AI_VERIFIED" ||
                m.status === "ADMIN_APPROVED" ||
                m.status === "CHAIN_PENDING" ||
                m.status === "CHAIN_FAILED" ||
                m.status === "DISBURSED"
            ).length,
          },
          {
            label: "Menunggu",
            value: result.milestones.filter(
              (m) => m.status === "PROOF_SUBMITTED"
            ).length,
          },
          {
            label: "Dana Cair",
            value: result.milestones.filter((m) => m.status === "DISBURSED")
              .length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[10px] border border-line-soft bg-surface p-3 text-center"
          >
            <p className="font-mono text-lg font-semibold text-ink tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <NewMilestoneForm campaignId={id} />

      {/* Milestone list */}
      <div className="space-y-3">
        {result.milestones.map((milestone) => {
          const config =
            STATUS_CONFIG[milestone.status] ?? STATUS_CONFIG.PENDING
          const StatusIcon = config.icon

          return (
            <section key={milestone.id} className="mz-card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                {/* Order badge */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-sm text-brand-700">
                  {milestone.order}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title + Status */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-ink">
                      {milestone.description}
                    </h2>
                    <span
                      className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-semibold tracking-[0.02em] uppercase ${config.bg} ${config.text}`}
                    >
                      <StatusIcon size={14} strokeWidth={1.5} />
                      {config.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <p className="mt-3 text-right font-mono text-sm text-ink tabular-nums">
                    {formatWei(milestone.amountWei)}{" "}
                    <span className="text-xs text-ink-muted">
                      {result.campaign.currency}
                    </span>
                  </p>

                  {/* Proof thumbnail + AI note */}
                  {milestone.proofImageUrl && (
                    <div className="mt-4 flex items-start gap-3 rounded-[6px] bg-surface-sunken p-3">
                      {isPdfUrl(milestone.proofImageUrl) ? (
                        <a
                          href={milestone.proofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[6px] border border-line-soft text-brand-700 hover:bg-brand-50"
                          aria-label="Bukti milestone"
                        >
                          <FileText size={22} strokeWidth={1.5} />
                          <span className="text-[10px] font-medium">PDF</span>
                        </a>
                      ) : (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={milestone.proofImageUrl}
                            alt="Bukti milestone"
                            className="size-16 shrink-0 rounded-[6px] border border-line-soft object-cover"
                          />
                        </>
                      )}
                      <div className="min-w-0 flex-1">
                        {milestone.proofNote && (
                          <p className="line-clamp-2 text-sm text-ink-muted">
                            {milestone.proofNote}
                          </p>
                        )}
                        {milestone.aiVerificationNote && (
                          <p className="mt-1 text-xs text-ink-muted">
                            <span className="font-medium">AI:</span>{" "}
                            {milestone.aiVerificationNote.slice(0, 200)}
                            {milestone.aiVerificationNote.length > 200
                              ? "…"
                              : ""}
                          </p>
                        )}
                        {milestone.aiConfidence != null && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-brand-100">
                              <div
                                className="h-full rounded-full bg-brand-700"
                                style={{
                                  width: `${(milestone.aiConfidence * 100).toFixed(0)}%`,
                                }}
                              />
                            </div>
                            <span className="font-mono text-[0.6875rem] text-ink-muted">
                              {(milestone.aiConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disbursement info */}
                  {milestone.disbursementRequestedAt && (
                    <p className="mt-2 text-xs text-ink-muted">
                      Pencairan diajukan:{" "}
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
                  {milestone.disbursementTxHash && (
                    <p className="mt-1 font-mono text-xs text-brand-700">
                      TX: {milestone.disbursementTxHash.slice(0, 10)}…
                      {milestone.disbursementTxHash.slice(-6)}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    {milestone.status === "AI_VERIFIED" && milestone.lockedAt && (
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-50 px-4 text-sm text-brand-700">
                        <Clock size={16} strokeWidth={1.5} />
                        Kelola bukti dan pencairan di halaman Penyaluran
                      </span>
                    )}
                  </div>
                  <MilestoneControls milestone={milestone} />
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {result.milestones.length === 0 && (
        <div className="mz-card p-8 text-center text-sm text-ink-muted">
          Belum ada milestone untuk kampanye ini.
        </div>
      )}
    </div>
  )
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

function isPdfUrl(url: string) {
  return url.split("?")[0].toLowerCase().endsWith(".pdf")
}
