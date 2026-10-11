"use client"

import * as React from "react"
import { useActionState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ImageUp, Loader2, X } from "lucide-react"

import { cn } from "@/src/lib/utils"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import type { CampaignFormState } from "@/src/lib/campaign-workflow"
import { uploadCampaignImage } from "@/src/lib/uploads/campaign-image"
import { CATEGORY_OPTIONS } from "@/src/lib/campaign-category"
import { useLanguage } from "@/components/site/language-provider"

type CampaignFormProps = {
  action: (
    state: CampaignFormState,
    formData: FormData
  ) => Promise<CampaignFormState>
  initialData?: CampaignReview | null
  submitLabel?: string
}

const INITIAL_STATE: CampaignFormState = { success: false, message: "" }

export function CampaignForm({
  action,
  initialData,
  submitLabel = "Simpan",
}: CampaignFormProps) {
  const { t } = useLanguage()
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)

  const [imageUrl, setImageUrl] = React.useState<string>(
    initialData?.image ?? ""
  )
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)
    const result = await uploadCampaignImage(file)
    setUploading(false)

    if (result.ok) {
      setImageUrl(result.url)
    } else {
      setUploadError(result.error)
    }
    // Reset the native input so re-selecting the same file re-triggers change.
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success ? (
        <div className="rounded-[6px] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
          {state.message}
        </div>
      ) : null}

      <p className="rounded-xl border border-line-soft bg-surface-sunken px-4 py-3 text-sm text-ink-muted">
        {t(
          "Draft kampanye dibuat oleh AI mock, lalu harus ditinjau admin sebelum aktif."
        )}
      </p>

      <Field
        id="title"
        label={t("Judul kampanye")}
        defaultValue={initialData?.title ?? initialData?.judul ?? ""}
        placeholder="Contoh: Bantuan pendidikan untuk 40 anak yatim"
        error={state.errors?.title ?? state.errors?.judul}
      />
      <Field
        id="organizerName"
        label={t("Penyelenggara")}
        defaultValue={
          initialData?.organizerName ?? initialData?.penyelenggara ?? ""
        }
        placeholder="Contoh: Yayasan Nurul Iman"
        error={state.errors?.organizerName ?? state.errors?.penyelenggara}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="category"
          label={t("Tipe kampanye")}
          defaultValue={initialData?.category ?? "DONASI_UMUM"}
          options={CATEGORY_OPTIONS}
          error={state.errors?.category}
        />
        <Field
          id="location"
          label={t("Lokasi")}
          required={false}
          defaultValue={initialData?.location ?? ""}
          placeholder="Contoh: Lombok Timur, NTB"
          error={state.errors?.location}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="target"
          label={t("Target dana (BNB)")}
          type="number"
          step="0.000000000000000001"
          min="0.000000000000000001"
          defaultValue={initialData?.target ?? ""}
          placeholder="0.00"
          error={state.errors?.target}
          inputClassName="font-mono tabular-nums"
        />
        <Field
          id="daysLeft"
          label={t("Sisa hari kampanye")}
          type="number"
          step="1"
          min="1"
          defaultValue={initialData?.daysLeft ?? ""}
          placeholder="Contoh: 30"
          error={state.errors?.daysLeft}
          inputClassName="font-mono tabular-nums"
        />
      </div>

      <Field
        id="recipientWallet"
        label={t("Wallet komunitas")}
        defaultValue={initialData?.recipientWallet ?? ""}
        placeholder="0x..."
        error={state.errors?.recipientWallet}
        inputClassName="font-mono text-xs"
      />

      <TextareaField
        id="summary"
        label={t("Deskripsi singkat")}
        required={false}
        defaultValue={initialData?.summary ?? ""}
        placeholder="Ringkasan singkat yang tampil di kartu kampanye."
        error={state.errors?.summary}
      />

      {/* Image upload + URL fallback. The hidden input carries the final value. */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          {t("Gambar sampul")}
        </label>
        <input type="hidden" name="image" value={imageUrl} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-[10px] border border-line-soft bg-surface-sunken sm:w-44">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt="Pratinjau sampul kampanye"
                  fill
                  sizes="176px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
                  aria-label={t("Hapus gambar")}
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-ink-muted">
                <ImageUp
                  className="size-5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-[0.6875rem]">
                  {t("Belum ada gambar")}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-brand-200 px-4 text-sm font-medium text-brand-700 transition-colors duration-150 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950"
                )}
              >
                {uploading ? (
                  <Loader2
                    className="size-4 animate-spin"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                ) : (
                  <ImageUp
                    className="size-4"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                )}
                {uploading ? t("Mengunggah…") : t("Unggah gambar")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="atau tempel URL gambar (https://… atau /gambar.png)"
              className={cn(
                "h-10 w-full rounded-[6px] border bg-surface px-3 text-sm text-ink transition-colors duration-150 outline-none",
                "border-line-ui placeholder:text-ink-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
                (uploadError || state.errors?.image) && "border-brand-500"
              )}
            />
            <p className="text-xs text-ink-muted">
              PNG, JPG, WEBP, atau GIF hingga 5 MB.
            </p>
            {uploadError ? (
              <p className="text-xs text-brand-500">{uploadError}</p>
            ) : state.errors?.image ? (
              <p className="text-xs text-brand-500">{state.errors.image}</p>
            ) : null}
          </div>
        </div>
      </div>

      <Field
        id="aiReference"
        label={t("Source / reference AI")}
        defaultValue={initialData?.aiReference ?? ""}
        placeholder="URL, ID laporan, atau referensi sumber"
        error={state.errors?.aiReference}
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-sm font-medium text-white transition-colors duration-150",
            "bg-brand-700 hover:bg-brand-600 active:bg-brand-800 disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {pending ? t("Menyimpan…") : t(submitLabel)}
        </button>
        <Link
          href="/admin/campaigns"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-brand-200 px-6 text-sm font-medium text-brand-700 transition-colors duration-150 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950"
        >
          {t("Batal")}
        </Link>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  defaultValue,
  placeholder,
  error,
  type = "text",
  step,
  min,
  required = true,
  inputClassName,
}: {
  id: string
  label: string
  defaultValue: string | number
  placeholder: string
  error?: string
  type?: string
  step?: string
  min?: string
  required?: boolean
  inputClassName?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {!required ? (
          <span className="ml-1 text-xs font-normal text-ink-muted">
            (opsional)
          </span>
        ) : null}
      </label>
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
          "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink transition-colors duration-150 outline-none",
          "border-line-ui placeholder:text-ink-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          inputClassName,
          error && "border-brand-500"
        )}
      />
      {error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}
    </div>
  )
}

function SelectField({
  id,
  label,
  defaultValue,
  options,
  error,
}: {
  id: string
  label: string
  defaultValue: string
  options: readonly { value: string; label: string }[]
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
        defaultValue={defaultValue}
        className={cn(
          "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink transition-colors duration-150 outline-none",
          "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          error && "border-brand-500"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}
    </div>
  )
}

function TextareaField({
  id,
  label,
  defaultValue,
  placeholder,
  error,
  required = true,
}: {
  id: string
  label: string
  defaultValue: string
  placeholder: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {!required ? (
          <span className="ml-1 text-xs font-normal text-ink-muted">
            (opsional)
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        name={id}
        rows={3}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-[6px] border bg-surface px-4 py-3 text-sm text-ink transition-colors duration-150 outline-none",
          "border-line-ui placeholder:text-ink-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
          error && "border-brand-500"
        )}
      />
      {error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}
    </div>
  )
}
