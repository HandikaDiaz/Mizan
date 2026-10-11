import Link from "next/link"
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  ImageIcon,
  FileText,
} from "lucide-react"
import { notFound } from "next/navigation"
import { getMilestones } from "../../actions"
import { DisbursementRequestForm } from "@/components/dashboard/disbursement-request-form"
import { canSubmitMilestoneProof } from "@/src/lib/milestone-management"
import { LocalizedText } from "@/components/dashboard/localized-text"

export default async function ProofPage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>
}) {
  const { id, milestoneId } = await params
  const result = await getMilestones(id)
  const milestone = result?.milestones.find(
    (item) => String(item.id) === milestoneId
  )
  if (!result || !milestone) notFound()

  const canSubmit = canSubmitMilestoneProof(milestone)

  return (
    <div className="mx-auto max-w-[720px]">
      <Link
        href={`/beneficiary/campaigns/${id}/milestones`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        Kembali ke milestone
      </Link>

      <p className="mz-overline">
        <LocalizedText text="Bukti penyaluran" />
      </p>
      <h1 className="mt-2 text-h1 text-ink">
        <LocalizedText text="Kirim bukti penggunaan dana" />
      </h1>
      <p className="mt-3 text-sm text-ink-muted">{milestone.description}</p>
      <p className="mt-1 font-mono text-sm text-ink tabular-nums">
        {formatWei(milestone.amountWei)}{" "}
        <span className="text-xs text-ink-muted">
          {result.campaign.currency}
        </span>
      </p>

      {/* Rejection warning */}
      {milestone.status === "REJECTED" && (
        <div className="mt-6 rounded-[10px] border border-coral/40 bg-coral/10 p-4 text-sm text-ink">
          <div className="flex items-start gap-3">
            <XCircle
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-coral"
            />
            <div>
              <p className="font-medium">Bukti sebelumnya perlu diperbaiki.</p>
              {milestone.aiVerificationNote && (
                <p className="mt-2 text-ink-muted">
                  Catatan AI: {milestone.aiVerificationNote}
                </p>
              )}
              {milestone.aiConfidence != null && (
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  Confidence: {(milestone.aiConfidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Verified state */}
      {milestone.status === "AI_VERIFIED" && (
        <div className="mt-6 rounded-[10px] border border-brand-200 bg-brand-50 p-4 text-sm text-ink">
          <div className="flex items-start gap-3">
            <CheckCircle
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-brand-700"
            />
            <div>
              <p className="font-medium text-brand-700">
                Bukti terverifikasi oleh AI
              </p>
              {milestone.aiVerificationNote && (
                <p className="mt-2 text-ink-muted">
                  {milestone.aiVerificationNote}
                </p>
              )}
              {milestone.aiConfidence != null && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>Confidence</span>
                    <span className="font-mono">
                      {(milestone.aiConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-brand-700 transition-[width] duration-300"
                      style={{
                        width: `${(milestone.aiConfidence * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proof submitted — waiting for AI */}
      {milestone.status === "PROOF_SUBMITTED" && (
        <div className="mt-6 rounded-[10px] border border-accent-200 bg-accent-200/10 p-4 text-sm text-ink">
          <div className="flex items-start gap-3">
            <Clock
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-ink-muted"
            />
            <p>
              Bukti sudah dikirim dan sedang menunggu verifikasi AI. Halaman ini
              akan diperbarui secara otomatis setelah selesai.
            </p>
          </div>
        </div>
      )}

      {milestone.status === "MANUAL_REVIEW" && (
        <div className="mt-6 rounded-[10px] border border-accent-200 bg-accent-200/10 p-4 text-sm text-ink">
          <div className="flex items-start gap-3">
            <Clock
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-ink-muted"
            />
            <div>
              <p className="font-medium">Bukti memerlukan review manual.</p>
              {milestone.aiVerificationNote ? (
                <p className="mt-2 text-ink-muted">{milestone.aiVerificationNote}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Show existing proof image if available */}
      {milestone.proofImageUrl && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-ink">
            Bukti yang diunggah
          </p>
          {isDocumentUrl(milestone.proofImageUrl) ? (
            <a
              href={milestone.proofImageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[10px] border border-line-soft bg-surface-sunken p-4 text-sm text-brand-700 underline-offset-4 hover:underline"
            >
              <FileText size={20} strokeWidth={1.5} />
              Buka dokumen bukti penyaluran
            </a>
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-line-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={milestone.proofImageUrl}
                alt="Bukti penyaluran dana"
                className="w-full object-contain"
                style={{ maxHeight: 400 }}
              />
            </div>
          )}
          {milestone.proofNote && (
            <p className="mt-3 rounded-[6px] bg-surface-sunken p-3 text-sm text-ink-muted">
              {milestone.proofNote}
            </p>
          )}
        </div>
      )}

      {/* Combined usage details, template, signed document, and analysis form */}
      {canSubmit ? (
        <DisbursementRequestForm
          milestoneId={milestone.id}
          milestoneDescription={milestone.description}
          currency={result.campaign.currency}
        />
      ) : (
        !milestone.proofImageUrl && (
          <div className="mt-8 flex items-center gap-3 rounded-[10px] border border-line-soft bg-very-light-purple p-5 text-sm text-ink-muted">
            <ImageIcon size={18} strokeWidth={1.5} className="shrink-0" />
            Bukti tidak dapat dikirim pada status saat ini.
          </div>
        )
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

function isDocumentUrl(url: string) {
  const path = url.split("?")[0].toLowerCase()
  return [".pdf", ".doc", ".docx"].some((extension) => path.endsWith(extension))
}
