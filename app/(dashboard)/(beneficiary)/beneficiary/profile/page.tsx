import Link from "next/link"
import { ChevronLeft, Copy } from "lucide-react"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { db } from "@/src/prisma/db"
import { TeamMembersSection, type MemberData } from "@/components/community/team-members-section"
import { CommunityProfileEditor } from "@/components/community/community-profile-editor"
import { LocalizedText } from "@/components/dashboard/localized-text"

const shorten = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value

export default async function BeneficiaryProfilePage() {
  const { community, memberRole } = await requireBeneficiaryCommunity()

  const status =
    community.verificationStatus === "VERIFIED"
      ? "Terverifikasi"
      : community.verificationStatus === "REJECTED"
      ? "Ditolak"
      : "Menunggu verifikasi"

  // Fetch all community members and user info
  const dbMembers = await db.orm.public.CommunityMember.where({
    communityId: community.id,
  }).all()

  const initialMembers: MemberData[] = await Promise.all(
    dbMembers.map(async (m) => {
      const user = await db.orm.public.User.where({ id: m.userId }).first()
      return {
        id: m.id,
        userId: m.userId,
        role: m.role as "OWNER" | "STAFF",
        status: m.status as "PENDING" | "ACTIVE" | "REJECTED",
        user: {
          id: m.userId,
          name: user?.name ?? null,
          email: user?.email ?? null,
          username: user?.username ?? null,
        },
      }
    })
  )

  return (
    <div className="mx-auto max-w-[840px]">
      <Link
        href="/beneficiary"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        <LocalizedText text="Kembali ke ringkasan" />
      </Link>
      <p className="mz-overline"><LocalizedText text="Organisasi" /></p>
      <h1 className="mt-2 text-h1 text-ink"><LocalizedText text="Profil organisasi" /></h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        <LocalizedText text="Informasi organisasi yang digunakan saat kampanye ditinjau dan dana disalurkan." />
      </p>

      {/* Detail Organisasi */}
      <section className="mz-card mt-8 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-h2 text-ink">{community.name}</h2>
            <p className="mt-2 text-sm text-ink-muted"><LocalizedText text="Community ID" /> {community.id}</p>
          </div>
          <span className="inline-flex h-7 items-center rounded-full bg-warm-yellow px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] text-ink">
            <LocalizedText text={status} />
          </span>
        </div>
        {memberRole === "OWNER" ? <div className="mt-5"><CommunityProfileEditor community={community} /></div> : null}

        <div className="mt-8 border-t border-line-soft pt-6">
          <p className="text-sm font-medium text-ink"><LocalizedText text="Dompet penerima" /></p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-[10px] bg-brand-950 p-4 text-brand-100">
            <span className="font-mono text-sm">{shorten(community.walletAddress)}</span>
            <span className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-warm-yellow px-2 py-1 font-semibold text-ink">
                BSC Testnet
              </span>
              <Copy size={18} strokeWidth={1.5} aria-label="Salin alamat dompet" />
            </span>
          </div>
          <a
            href={`https://testnet.bscscan.com/address/${community.walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-brand-700 underline-offset-2 hover:underline"
          >
            <LocalizedText text="Lihat dompet di BscScan ↗" />
          </a>
        </div>
      </section>

      <section className="mz-card mt-6 p-5 sm:p-8">
        <h2 className="text-h2 text-ink"><LocalizedText text="Informasi publik" /></h2>
        <p className="mt-2 text-sm text-ink-muted"><LocalizedText text="Data berikut dapat dilihat donatur melalui halaman profil organisasi." /></p>
        <dl className="mt-5 divide-y divide-line-soft">
          <InfoRow label="Deskripsi" value={community.description || "Belum diisi"} />
          <InfoRow label="Website" value={community.websiteUrl || "Belum diisi"} />
          <InfoRow label="Email kontak" value={community.contactEmail || "Belum diisi"} />
          <InfoRow label="Nomor kontak" value={community.contactPhone || "Belum diisi"} />
          <InfoRow label="Alamat" value={community.address || "Belum diisi"} />
        </dl>
      </section>

      {/* Legalitas */}
      <section className="mz-card mt-6 p-5 sm:p-8">
        <h2 className="text-h2 text-ink"><LocalizedText text="Legalitas" /></h2>
        <p className="mt-2 text-sm text-ink-muted">
          <LocalizedText text="Status verifikasi legalitas dikelola oleh Admin Mizan. Perubahan data akan ditinjau kembali sebelum status berubah." />
        </p>
        <label className="mt-6 block text-sm font-medium text-ink">
          <LocalizedText text="Nomor registrasi" />
          <input
            className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm"
            placeholder="Masukkan nomor registrasi"
            defaultValue={community.registrationNumber || ""}
            disabled={memberRole !== "OWNER"}
          />
        </label>
        <label className="mt-5 block text-sm font-medium text-ink">
          <LocalizedText text="Dokumen legalitas" />
          <input
            type="file"
            accept="application/pdf,image/*"
            className="mt-2 block min-h-12 w-full rounded-[6px] border border-line-ui bg-surface px-3 py-3 text-sm"
            disabled={memberRole !== "OWNER"}
          />
        </label>
        {memberRole === "OWNER" ? <button
          type="button"
          className="mt-6 min-h-11 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white"
        >
          <LocalizedText text="Ajukan perubahan profil" />
        </button> : <p className="mt-6 text-xs text-ink-muted"><LocalizedText text="Hanya owner organisasi yang dapat mengubah data profil." /></p>}
      </section>

      {/* Section Anggota Tim */}
      <TeamMembersSection
        initialMembers={initialMembers}
        currentUserRole={memberRole}
        inviteCode={community.inviteCode}
      />

      <p className="mt-6 text-xs text-ink-muted"><LocalizedText text="Data testnet — dana tidak nyata." /></p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4"><dt className="text-sm text-ink-muted"><LocalizedText text={label} /></dt><dd className="whitespace-pre-wrap text-sm text-ink sm:max-w-[65%] sm:text-right">{value}</dd></div>
}
