"use client"

import { useActionState, useState, useTransition } from "react"
import { LockKeyhole, Pencil, Plus, Trash2, X } from "lucide-react"

import {
  createMilestone,
  deleteMilestone,
  lockMilestone,
  updateMilestone,
} from "./actions"

type ActionState = { success: boolean; message: string }

type Milestone = {
  id: number
  description: string
  amountWei: string
  lockedAt: string | null
}

const INITIAL_STATE: ActionState = { success: false, message: "" }

export function NewMilestoneForm({ campaignId }: { campaignId: string }) {
  const action = createMilestone.bind(null, campaignId)
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)

  return (
    <section className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/40 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Plus className="mt-0.5 size-5 text-brand-700" strokeWidth={1.7} />
        <div>
          <h2 className="font-semibold text-ink">Tambah milestone</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Buat tahapan penyaluran baru sebelum milestone dikunci.
          </p>
        </div>
      </div>
      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <label className="text-xs font-medium text-ink">
          Deskripsi milestone
          <input
            name="description"
            required
            placeholder="Contoh: Distribusi paket pangan tahap 1"
            className="mt-1.5 h-11 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-ink">
          Nominal (BNB)
          <input
            name="amount"
            required
            inputMode="decimal"
            placeholder="0.5"
            className="mt-1.5 h-11 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Tambah"}
        </button>
      </form>
      {state.message ? (
        <p className={`mt-3 text-xs ${state.success ? "text-brand-700" : "text-coral"}`} role="status">
          {state.message}
        </p>
      ) : null}
    </section>
  )
}

export function MilestoneControls({ milestone }: { milestone: Milestone }) {
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const action = updateMilestone.bind(null, String(milestone.id))
  const [editState, editFormAction, editPending] = useActionState(action, INITIAL_STATE)

  const handleDelete = () => {
    if (!window.confirm("Hapus milestone ini? Tindakan ini tidak dapat dibatalkan.")) return
    setMessage(null)
    startTransition(async () => {
      const result = await deleteMilestone(String(milestone.id))
      setMessage(result.message)
    })
  }

  const handleLock = () => {
    const confirmed = window.confirm(
      "Kunci milestone ini sekarang? Setelah dikunci, milestone tidak dapat diedit atau dihapus lagi. Pastikan deskripsi dan nominalnya sudah benar.",
    )
    if (!confirmed) return
    setMessage(null)
    startTransition(async () => {
      const result = await lockMilestone(String(milestone.id))
      setMessage(result.message)
    })
  }

  if (editing && !milestone.lockedAt) {
    return (
      <form action={editFormAction} className="mt-4 rounded-lg border border-line-soft bg-surface-sunken p-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <label className="text-xs font-medium text-ink">
            Deskripsi milestone
            <input
              name="description"
              required
              defaultValue={milestone.description}
              className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Nominal (BNB)
            <input
              name="amount"
              required
              inputMode="decimal"
              defaultValue={weiToBnb(milestone.amountWei)}
              className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={editPending} className="h-10 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white disabled:opacity-50">
              {editPending ? "Menyimpan…" : "Simpan"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="inline-flex h-10 items-center justify-center rounded-lg border border-line-ui px-3 text-ink-muted">
              <X className="size-4" />
            </button>
          </div>
        </div>
        {editState.message ? <p className={`mt-2 text-xs ${editState.success ? "text-brand-700" : "text-coral"}`}>{editState.message}</p> : null}
      </form>
    )
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
      {milestone.lockedAt ? (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-surface-sunken px-3 text-xs font-medium text-ink-muted">
          <LockKeyhole className="size-4" /> Terkunci
        </span>
      ) : (
        <>
          <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-ui px-3 text-xs font-medium text-ink hover:bg-surface-sunken">
            <Pencil className="size-4" /> Edit
          </button>
          <button type="button" onClick={handleDelete} disabled={isPending} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-coral/30 px-3 text-xs font-medium text-coral hover:bg-coral/10 disabled:opacity-50">
            <Trash2 className="size-4" /> Hapus
          </button>
          <button type="button" onClick={handleLock} disabled={isPending} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-700 px-3 text-xs font-medium text-white hover:bg-brand-800 disabled:opacity-50">
            <LockKeyhole className="size-4" /> Kunci milestone
          </button>
        </>
      )}
      {message ? <p className="basis-full text-right text-xs text-ink-muted" role="status">{message}</p> : null}
    </div>
  )
}

function weiToBnb(value: string): string {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .replace(/0+$/, "")
    .slice(0, 8)
  return fraction ? `${whole}.${fraction}` : whole.toString()
}
