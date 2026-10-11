"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import { CATEGORIES } from "@/src/lib/site-data"
import type { BeneficiaryCampaign, BeneficiaryCampaignFormState } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"

// ── Types ──────────────────────────────────────────────────────────────────

type FormAction = (
  state: BeneficiaryCampaignFormState,
  formData: FormData,
) => Promise<BeneficiaryCampaignFormState>

type BeneficiaryCampaignFormProps = {
  action: FormAction
  initialData?: BeneficiaryCampaign | null
  submitLabel?: string
}

const INITIAL_STATE: BeneficiaryCampaignFormState = { success: false, message: "" }

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert wei string to human-readable decimal (max 8 dp). */
function weiToDecimal(wei: string): string {
  if (!wei || wei === "0") return ""
  const big = BigInt(wei)
  const whole = big / BigInt("1000000000000000000")
  const frac = (big % BigInt("1000000000000000000")).toString().padStart(18, "0")
  const trimmed = frac.replace(/0+$/, "").slice(0, 8)
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({
  id,
  label,
  hint,
  defaultValue = "",
  placeholder,
  error,
  type = "text",
  step,
  min,
  inputClassName,
  required = true,
}: {
  id: string
  label: string
  hint?: string
  defaultValue?: string | number
  placeholder?: string
  error?: string
  type?: string
  step?: string
  min?: string
  inputClassName?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {!required && <span className="ml-1 text-xs text-ink-muted">(opsional)</span>}
      </label>
      {hint ? <p className="mb-1.5 text-xs text-ink-muted">{hint}</p> : null}
      <input
        id={id}
        name={id}
        type={type}
        step={step}
        min={min}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
          "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100 placeholder:text-ink-muted",
          inputClassName,
          error && "border-brand-500 focus:border-brand-500 focus:ring-brand-100",
        )}
      />
      {error ? <p className="mt-1 text-xs text-coral">{error}</p> : null}
    </div>
  )
}

function TextareaField({
  id,
  label,
  hint,
  defaultValue = "",
  placeholder,
  error,
  rows = 4,
}: {
  id: string
  label: string
  hint?: string
  defaultValue?: string
  placeholder?: string
  error?: string
  rows?: number
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {hint ? <p className="mb-1.5 text-xs text-ink-muted">{hint}</p> : null}
      <textarea
        id={id}
        name={id}
        rows={rows}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "w-full resize-y rounded-[6px] border bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors duration-150",
          "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100 placeholder:text-ink-muted",
          error && "border-brand-500 focus:border-brand-500 focus:ring-brand-100",
        )}
      />
      {error ? <p className="mt-1 text-xs text-coral">{error}</p> : null}
    </div>
  )
}

function SelectField({
  id,
  label,
  defaultValue = "",
  options,
  error,
}: {
  id: string
  label: string
  defaultValue?: string
  options: { value: string; label: string }[]
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        name={id}
        required
        defaultValue={defaultValue}
        className={cn(
          "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
          "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          error && "border-brand-500 focus:border-brand-500 focus:ring-brand-100",
        )}
      >
        <option value="" disabled>
          Pilih kategori…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-coral">{error}</p> : null}
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────

export function BeneficiaryCampaignForm({
  action,
  initialData,
  submitLabel = "Simpan",
}: BeneficiaryCampaignFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)

  const isEditMode = !!initialData
  const isLocked =
    isEditMode &&
    initialData.reviewStatus !== "AI_DRAFT" &&
    initialData.reviewStatus !== "REJECTED"

  const categoryOptions = CATEGORIES.map((c) => ({ value: c.name, label: c.name }))
  const defaultTarget = initialData ? weiToDecimal(initialData.targetAmountWei) : ""

  return (
    <form action={formAction} className="space-y-6">
      {/* Global error / success banner */}
      {state.message ? (
        <div
          className={cn(
            "rounded-[6px] border px-4 py-3 text-sm",
            state.success
              ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
              : "border-coral/30 bg-coral/10 text-coral",
          )}
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      {/* Lock notice */}
      {isLocked ? (
        <div className="rounded-xl border border-line-soft bg-surface-sunken px-4 py-3 text-sm text-ink-muted">
          Kampanye ini sudah diajukan untuk review dan tidak dapat diedit. Tunggu keputusan admin atau hubungi tim Mizan.
        </div>
      ) : null}

      {/* Section: Informasi dasar */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Informasi Dasar</h2>

        <Field
          id="title"
          label="Judul kampanye"
          defaultValue={initialData?.title ?? ""}
          placeholder="Contoh: Bantuan pendidikan 40 anak yatim di Lombok"
          error={state.errors?.title}
          inputClassName={isLocked ? "opacity-60 cursor-not-allowed" : ""}
        />

        <TextareaField
          id="description"
          label="Deskripsi kampanye"
          hint="Jelaskan tujuan kampanye, siapa penerima manfaatnya, dan bagaimana dana akan digunakan."
          defaultValue={initialData?.description ?? ""}
          placeholder="Ceritakan latar belakang kampanye, dampak yang diharapkan, dan rencana penyaluran dana…"
          rows={5}
          error={state.errors?.description}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            id="category"
            label="Kategori"
            defaultValue={initialData?.category ?? ""}
            options={categoryOptions}
            error={state.errors?.category}
          />
          <Field
            id="organizerName"
            label="Nama penyelenggara"
            defaultValue={initialData?.organizerName ?? ""}
            placeholder="Contoh: Yayasan Nurul Iman"
            error={state.errors?.organizerName}
          />
        </div>
      </section>

      <hr className="border-line-soft" />

      {/* Section: Dana */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Target Dana</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="target"
            label="Target dana (BNB)"
            type="number"
            step="0.000000000000000001"
            min="0.000000000000000001"
            defaultValue={defaultTarget}
            placeholder="0.00"
            error={state.errors?.target}
            inputClassName="font-mono tabular-nums"
            hint="Jumlah total BNB yang ingin dikumpulkan."
          />

          {/* Currency hidden input — fixed to BNB for now */}
          <input type="hidden" name="currency" value="BNB" />

          <Field
            id="recipientWallet"
            label="Wallet penerima"
            defaultValue={initialData?.recipientWallet ?? ""}
            placeholder="0x…"
            error={state.errors?.recipientWallet}
            inputClassName="font-mono text-xs"
            hint="Alamat EVM tempat dana dicairkan. Pastikan ini adalah wallet yang Anda kendalikan."
          />
        </div>

        <div className="rounded-xl border border-line-soft bg-surface-sunken px-4 py-3 text-sm text-ink-muted">
          <strong className="font-medium text-ink">Catatan:</strong> Kampanye yang dibuat akan
          berstatus <em>Draft</em> dan harus diajukan ke admin untuk ditinjau sebelum bisa aktif
          menerima donasi. Dana{" "}
          <strong className="font-medium text-ink">tidak akan langsung ke blockchain</strong> —
          pencairan mengikuti milestone yang terverifikasi.
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || isLocked}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-sm font-medium text-white transition-colors duration-150",
            "bg-brand-700 hover:bg-brand-600 active:bg-brand-800 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        <Link
          href="/beneficiary/campaigns"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-line-ui px-6 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}
