"use client"

import { FormEvent, useState } from "react"
import { Info } from "lucide-react"

import {
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from "@/src/lib/onboarding/profile-schema"

const ROLE_OPTIONS = [
  {
    value: "BENEFACTOR",
    label: "Donatur",
    sublabel: "Pemberi Bantuan",
    description:
      "Berperan sebagai donatur untuk menyalurkan dana bantuan langsung ke kampanye terverifikasi, memantau transparansi real-time on-chain, dan melacak riwayat kontribusi.",
  },
  {
    value: "BENEFICIARY",
    label: "Penerima Manfaat",
    sublabel: "Komunitas / Lembaga",
    description:
      "Berperan sebagai perwakilan komunitas atau yayasan untuk mengajukan kebutuhan, mengelola kampanye penyaluran, dan menerima alokasi dana bantuan.",
  },
] as const

type OnboardingFormValues = {
  username: string
  domicile: string
  userType: OnboardingProfileInput["userType"]
  whatsappNumber: string
  whatsappNotificationConsent: boolean
  referralSource: OnboardingProfileInput["referralSource"]
  referralSourceOther: string
  dataConsent: boolean
}

type OnboardingModalProps = {
  identityToken: string
  onCompleted: (userType: OnboardingProfileInput["userType"]) => void
}

const initialValues: OnboardingFormValues = {
  username: "",
  domicile: "",
  userType: "BENEFACTOR",
  whatsappNumber: "",
  whatsappNotificationConsent: false,
  referralSource: "SOCIAL_MEDIA",
  referralSourceOther: "",
  dataConsent: false,
}

export function OnboardingModal({
  identityToken,
  onCompleted,
}: OnboardingModalProps) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateValue = <Key extends keyof OnboardingFormValues>(
    key: Key,
    value: OnboardingFormValues[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsed = onboardingProfileSchema.safeParse({
      ...values,
      whatsappNumber: values.whatsappNumber || null,
      referralSourceOther: values.referralSourceOther || null,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa kembali data Anda.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "privy-id-token": identityToken,
        },
        body: JSON.stringify(parsed.data),
      })

      if (!response.ok) {
        throw new Error("Profil belum dapat disimpan. Coba lagi.")
      }

      onCompleted(parsed.data.userType)
    } catch (submissionError) {
      console.error("Onboarding form failed", submissionError)
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Profil belum dapat disimpan. Coba lagi."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/60 px-4 py-8">
      <div
        className="mx-auto max-w-2xl rounded-xl border border-line-soft bg-canvas p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase">
          Langkah pertama
        </p>
        <h1 id="onboarding-title" className="mt-2 text-2xl font-bold text-ink">
          Kenalan dengan Mizan
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-body">
          Lengkapi profil satu kali agar kami dapat menyesuaikan pengalaman dan
          mengirimkan informasi penting yang relevan.
        </p>

        <form className="mt-6 space-y-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Username
              <input
                required
                value={values.username}
                onChange={(event) =>
                  updateValue("username", event.target.value)
                }
                placeholder="contoh: mizan_user"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-ink">
              Kota / domisili
              <input
                required
                value={values.domicile}
                onChange={(event) =>
                  updateValue("domicile", event.target.value)
                }
                placeholder="Contoh: Yogyakarta"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink">
              Tipe pengguna
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = values.userType === role.value
                return (
                  <label
                    key={role.value}
                    className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3.5 text-sm transition-all duration-150 ${isSelected
                        ? "border-brand-700 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/40"
                        : "border-line-soft bg-surface hover:border-brand-700/60"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="radio"
                        name="userType"
                        value={role.value}
                        checked={isSelected}
                        onChange={() =>
                          updateValue(
                            "userType",
                            role.value as OnboardingFormValues["userType"]
                          )
                        }
                        className="size-4 text-brand-700 focus:ring-brand-700"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink leading-tight">
                          {role.label}
                        </p>
                        <p className="text-xs text-ink-muted leading-tight mt-0.5">
                          {role.sublabel}
                        </p>
                      </div>
                    </div>

                    {/* Tooltip info icon */}
                    <div
                      className="group/info relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Informasi role ${role.label}`}
                        className="flex size-6 items-center justify-center rounded-full text-ink-muted hover:text-brand-700 hover:bg-brand-100/60 dark:hover:bg-brand-900/60 focus:outline-none focus:ring-1 focus:ring-brand-700 transition-colors"
                      >
                        <Info className="size-4" strokeWidth={1.75} />
                      </button>

                      <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 sm:w-72 rounded-xl border border-line-soft bg-white p-3.5 text-xs font-normal leading-relaxed text-ink shadow-2xl opacity-0 transition-opacity duration-200 group-hover/info:pointer-events-auto group-hover/info:opacity-100 group-focus-within/info:pointer-events-auto group-focus-within/info:opacity-100 z-50 dark:bg-zinc-900 dark:border-zinc-700">
                        <p className="font-semibold text-brand-700 dark:text-brand-300 mb-1">
                          Role: {role.label}
                        </p>
                        <p className="text-ink-muted leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Nomor WhatsApp{" "}
              <span className="font-normal text-ink-muted">(opsional)</span>
              <input
                type="tel"
                value={values.whatsappNumber}
                onChange={(event) =>
                  updateValue("whatsappNumber", event.target.value)
                }
                placeholder="+6281234567890"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <label className="flex items-start gap-2 pt-7 text-sm text-ink-body">
              <input
                type="checkbox"
                checked={values.whatsappNotificationConsent}
                onChange={(event) =>
                  updateValue(
                    "whatsappNotificationConsent",
                    event.target.checked
                  )
                }
                className="mt-1"
              />
              Kirim notifikasi penting melalui WhatsApp.
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Tahu Mizan dari mana?
              <select
                value={values.referralSource}
                onChange={(event) =>
                  updateValue(
                    "referralSource",
                    event.target.value as OnboardingFormValues["referralSource"]
                  )
                }
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              >
                <option value="SOCIAL_MEDIA">Media sosial</option>
                <option value="FRIEND">Teman / keluarga</option>
                <option value="COMMUNITY">Komunitas</option>
                <option value="SEARCH">Mesin pencari</option>
                <option value="EVENT">Acara / kampanye</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </label>

            {values.referralSource === "OTHER" ? (
              <label className="space-y-2 text-sm font-medium text-ink">
                Jelaskan sumber lainnya
                <input
                  required
                  value={values.referralSourceOther}
                  onChange={(event) =>
                    updateValue("referralSourceOther", event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
                />
              </label>
            ) : null}
          </div>

          <label className="flex items-start gap-2 text-sm text-ink-body">
            <input
              type="checkbox"
              required
              checked={values.dataConsent}
              onChange={(event) =>
                updateValue("dataConsent", event.target.checked)
              }
              className="mt-1"
            />
            Saya menyetujui penggunaan data untuk kebutuhan layanan Mizan.
          </label>

          {error ? (
            <p
              className="rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-md bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan profil…" : "Simpan dan lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  )
}
