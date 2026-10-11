import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  ImageUp,
  ListChecks,
  Pencil,
  Users,
} from "lucide-react"
import { cn } from "@/src/lib/utils"

import { getBeneficiaryCampaignById } from "../actions"
import { CampaignDetailActions } from "./campaign-detail-actions"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const campaign = await getBeneficiaryCampaignById(id)
  return {
    title: campaign
      ? `${campaign.title} — Penerima Manfaat`
      : "Kampanye — Penerima Manfaat",
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  DRAFT: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Draft" },
  PENDING_REVIEW: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Menunggu Review Admin",
  },
  AKTIF: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  SELESAI: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Selesai" },
  DITUTUP: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Ditutup",
  },
  DITOLAK: { bg: "bg-coral/10", text: "text-coral", label: "Ditolak" },
} as const

function formatWeiBnb(wei: string): string {
  const big = BigInt(wei || "0")
  const whole = big / BigInt("1000000000000000000")
  const frac = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole.toString()
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line-soft py-3 last:border-b-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function KampanyeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id } = await params
  const { created } = await searchParams
  const campaign = await getBeneficiaryCampaignById(id)
  if (!campaign) notFound()

  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.DRAFT
  const raisedBnb = formatWeiBnb(campaign.raisedAmountWei)
  const targetBnb = formatWeiBnb(campaign.targetAmountWei)
  const isDraft = campaign.reviewStatus === "AI_DRAFT"
  const isRejected = campaign.reviewStatus === "REJECTED"
  const canEdit = isDraft || isRejected

  const createdDate = new Date(campaign.createdAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const updatedDate = new Date(campaign.updatedAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-[1040px]">
      {/* Breadcrumb */}
      <Link
        href="/beneficiary/campaigns"
        className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Kampanye Saya
      </Link>

      {/* Header */}
      {created === "1" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
          <div>
            <p className="font-semibold">Kampanye berhasil dibuat</p>
            <p className="mt-0.5 text-brand-700/80">
              Kampanye tersimpan dan siap menunggu review admin.
            </p>
          </div>
        </div>
      )}

      <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mz-overline">Detail kampanye</p>
          <h1 className="mt-2 max-w-3xl text-h1 text-ink">{campaign.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
            Kelola perkembangan, milestone, dan pencairan dana kampanye dari satu tempat.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold",
                statusCfg.bg,
                statusCfg.text,
              )}
            >
              {statusCfg.label}
            </span>
            <span className="inline-flex h-8 items-center rounded-full border border-line-soft bg-surface px-3 text-xs text-ink-muted">
              {campaign.category}
            </span>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {canEdit && (
            <Link
              href={`/beneficiary/campaigns/${id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-line-ui px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Edit
            </Link>
          )}
          {/* Delete + submit-for-review use client component with confirmation dialogs */}
          <CampaignDetailActions campaignId={id} status={campaign.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left / main */}
        <div className="space-y-6">
          {/* Description */}
          {campaign.description ? (
            <section className="rounded-2xl border border-line-soft bg-surface p-6 shadow-xs sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Tentang kampanye</h2>
                <span className="text-xs text-ink-muted">Ringkasan</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {campaign.description}
              </p>
            </section>
          ) : null}

          {/* Progress */}
          <section className="overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 shadow-xs">
            <div className="border-b border-brand-200 px-6 pb-5 pt-6 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-900">Progress dana</p>
                  <p className="mt-1 text-sm text-brand-700/80">Dana terkumpul dari para donatur.</p>
                </div>
                <CircleDollarSign className="size-6 text-brand-700" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <span className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.04em] text-brand-950">
                  {raisedBnb}
                  <span className="ml-1 text-sm font-normal tracking-normal text-brand-700/80">{campaign.currency}</span>
                </span>
                <span className="pb-1 text-right text-xs text-brand-700/80">
                  Target<br /><span className="font-mono text-sm tabular-nums text-brand-900">{targetBnb} {campaign.currency}</span>
                </span>
              </div>
            </div>
            <div className="px-6 py-5 sm:px-7">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-xs font-medium text-brand-700">Terkumpul</span>
                <span className="font-mono text-xs tabular-nums text-brand-700">
                  {campaign.progressPct}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-brand-200">
                <div
                  className="h-full rounded-full bg-brand-700 transition-[width] duration-300"
                  style={{ width: `${campaign.progressPct}%` }}
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-brand-200 pt-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-brand-700">
                    <Users className="size-3.5" aria-hidden="true" /> Donatur
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-brand-950">
                    {campaign.donorCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-700">Milestone aktif</p>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-950">
                    {campaign.nextMilestone ?? "Belum ada"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Milestone & bukti — coming soon stubs */}
          <section className="rounded-2xl border border-line-soft bg-surface p-6 shadow-xs sm:p-7">
            <div className="mb-5">
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Kelola kampanye</h2>
              <p className="mt-1 text-sm text-ink-muted">Pilih tindakan yang ingin dilakukan selanjutnya.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Link href={`/beneficiary/campaigns/${id}/milestones`} className="group flex min-h-24 flex-col items-start justify-between gap-4 rounded-xl border border-line-soft px-4 py-4 text-sm text-ink transition-colors hover:border-brand-300 hover:bg-brand-50">
                <span className="flex items-center gap-2">
                  <ListChecks className="size-5 text-brand-700" strokeWidth={1.5} aria-hidden="true" />
                  Kelola Milestone
                </span>
                <span className="flex w-full items-center justify-between text-xs text-ink-muted">Atur tahapan penyaluran <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></span>
              </Link>
              <Link href={`/beneficiary/campaigns/${id}/disbursement`} className="group flex min-h-24 flex-col items-start justify-between gap-4 rounded-xl border border-line-soft px-4 py-4 text-sm text-ink transition-colors hover:border-brand-300 hover:bg-brand-50">
                <span className="flex items-center gap-2">
                  <Banknote className="size-5 text-brand-700" strokeWidth={1.5} aria-hidden="true" />
                  Ajukan Pencairan Dana
                </span>
                <span className="flex w-full items-center justify-between text-xs text-ink-muted">Kirim permintaan pencairan <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" /></span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right / meta */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface p-6 shadow-xs">
            <p className="mz-overline">Informasi</p>
            <h2 className="mb-3 mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">Detail kampanye</h2>
            <dl>
              <InfoRow label="Penyelenggara" value={campaign.organizerName} />
              <InfoRow label="Kategori" value={campaign.category} />
              <InfoRow label="Status" value={statusCfg.label} />
              <InfoRow
                label="Wallet penerima"
                value={
                  campaign.recipientWallet ? (
                    <span className="break-all font-mono text-xs">
                      {campaign.recipientWallet}
                    </span>
                  ) : (
                    <span className="text-ink-muted">Belum diatur</span>
                  )
                }
              />
              <InfoRow label="Dibuat" value={createdDate} />
              <InfoRow label="Diperbarui" value={updatedDate} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
