"use client"

import { useState } from "react"
import { Users, Check, X, Copy, Shield, User, Loader2 } from "lucide-react"

export type MemberData = {
  id: number
  userId: number
  role: "OWNER" | "STAFF"
  status: "PENDING" | "ACTIVE" | "REJECTED"
  user: {
    id: number
    name: string | null
    email: string | null
    username: string | null
  }
}

interface TeamMembersSectionProps {
  initialMembers: MemberData[]
  currentUserRole: "OWNER" | "STAFF"
  inviteCode: string
}

export function TeamMembersSection({
  initialMembers,
  currentUserRole,
  inviteCode,
}: TeamMembersSectionProps) {
  const [members, setMembers] = useState<MemberData[]>(initialMembers)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = currentUserRole === "OWNER"

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdateStatus = async (memberId: number, status: "ACTIVE" | "REJECTED") => {
    if (!isOwner) return

    setActionLoadingId(memberId)
    setError(null)

    try {
      const res = await fetch(`/api/community-members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengupdate keanggotaan")
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status } : m))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setActionLoadingId(null)
    }
  }

  const pendingMembers = members.filter((m) => m.status === "PENDING")
  const activeMembers = members.filter((m) => m.status === "ACTIVE")

  return (
    <section className="mz-card mt-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h2 text-ink flex items-center gap-2">
            <Users size={22} className="text-brand-700" /> Anggota Tim Organisasi
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Kelola anggota staf yang dapat mengakses dashboard dan membuat kampanye atas nama organisasi.
          </p>
        </div>

        {/* Kode Undangan */}
        <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-brand-50 p-2.5">
          <span className="text-xs font-semibold text-ink-muted">Kode Undangan:</span>
          <span className="font-mono text-sm font-bold text-brand-900 tracking-wider">
            {inviteCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex h-7 w-7 items-center justify-center rounded bg-surface text-brand-700 hover:bg-brand-100 transition-colors"
            title="Salin Kode Undangan"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* List Permintaan Bergabung PENDING (Di Atas) */}
      {pendingMembers.length > 0 && (
        <div className="mt-6 rounded-xl border border-warm-yellow/50 bg-warm-yellow/10 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-warm-yellow animate-pulse" />
            <h3 className="text-sm font-bold text-ink">
              Permintaan Bergabung Menunggu Persetujuan ({pendingMembers.length})
            </h3>
          </div>

          <div className="mt-3 divide-y divide-warm-yellow/20">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink font-semibold text-xs border border-line-soft">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {member.user.name || member.user.username || `User #${member.userId}`}
                    </p>
                    <p className="text-xs text-ink-muted">{member.user.email || "Tanpa email"}</p>
                  </div>
                </div>

                {/* Tombol Aksi - Hanya untuk OWNER */}
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === member.id}
                      onClick={() => handleUpdateStatus(member.id, "ACTIVE")}
                      className="mz-btn mz-btn-primary min-h-9 px-3 text-xs bg-brand-700 hover:bg-brand-800 flex items-center gap-1.5"
                    >
                      {actionLoadingId === member.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={14} /> Terima
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === member.id}
                      onClick={() => handleUpdateStatus(member.id, "REJECTED")}
                      className="mz-btn min-h-9 px-3 text-xs border border-line-ui bg-surface text-ink hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Tolak
                    </button>
                  </div>
                ) : (
                  <span className="text-xs italic text-ink-muted">
                    Menunggu persetujuan Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List Member ACTIVE */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Anggota Aktif ({activeMembers.length})
        </h3>

        <div className="mt-3 divide-y divide-line-soft rounded-lg border border-line-soft bg-surface">
          {activeMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs">
                  {member.role === "OWNER" ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      {member.user.name || member.user.username || `User #${member.userId}`}
                    </p>
                    {member.role === "OWNER" && (
                      <span className="rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        OWNER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted">{member.user.email || "Tanpa email"}</p>
                </div>
              </div>

              <span className="inline-flex h-6 items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 text-[11px] font-semibold text-emerald-700">
                Aktif
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
