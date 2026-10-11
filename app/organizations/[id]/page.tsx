import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, BadgeCheck, ExternalLink, Globe, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { CampaignCard } from "@/components/site/ui/campaign-card"
import { DisbursementHistory } from "@/components/site/sections/disbursement-history"
import { getPublicOrganizationById } from "@/src/lib/campaigns-server"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const organization = await getPublicOrganizationById((await params).id)
  return { title: organization ? `${organization.name} — Profil Organisasi` : "Profil Organisasi" }
}

export default async function OrganizationProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const organization = await getPublicOrganizationById((await params).id)
  if (!organization) notFound()

  const verified = organization.verificationStatus === "VERIFIED"
  const initials = organization.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  return <>
    <SiteHeader />
    <main className="bg-very-light-purple">
      <section className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <Link href="/campaigns" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-purple hover:text-brand-violet"><ArrowLeft className="size-4" />Kembali ke kampanye</Link>
        <div className="mt-8 rounded-[2rem] border border-line-soft bg-surface p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {organization.logoUrl ? <Image src={organization.logoUrl} alt={`Logo ${organization.name}`} width={96} height={96} className="size-24 rounded-2xl border border-line-soft object-cover" unoptimized /> : <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-soft-lavender text-3xl font-bold text-primary-purple">{initials}</div>}
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="mz-overline">Profil organisasi</p>{verified ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"><BadgeCheck className="size-3.5" />Terverifikasi</span> : <span className="rounded-full bg-warm-yellow px-3 py-1 text-xs font-semibold text-ink">Menunggu verifikasi</span>}</div><h1 className="mt-3 text-h1 text-ink">{organization.name}</h1><p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-ink-muted">{organization.description || "Organisasi ini belum menambahkan deskripsi publik."}</p></div>
          </div>
          <div className="mt-8 grid gap-4 border-t border-line-soft pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {organization.address ? <Info icon={<MapPin className="size-4" />} label="Alamat" value={organization.address} /> : null}
            {organization.contactEmail ? <Info icon={<Mail className="size-4" />} label="Email" value={organization.contactEmail} /> : null}
            {organization.contactPhone ? <Info icon={<Phone className="size-4" />} label="Kontak" value={organization.contactPhone} /> : null}
            {organization.websiteUrl ? <Info icon={<Globe className="size-4" />} label="Website" value={<a href={organization.websiteUrl} target="_blank" rel="noreferrer" className="break-all text-primary-purple hover:underline">{organization.websiteUrl}</a>} /> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-violet" /><h2 className="text-h2 text-ink">Bukti kepercayaan</h2></div><dl className="mt-5 divide-y divide-line-soft"><Row label="Nomor registrasi" value={organization.registrationNumber || "Belum diisi"} /><Row label="Wallet treasury" value={<span className="break-all font-mono text-xs">{organization.walletAddress}</span>} />{organization.legalDocumentUrl ? <Row label="Dokumen legalitas" value={<a href={organization.legalDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-purple hover:underline">Lihat dokumen <ExternalLink className="size-3.5" /></a>} /> : null}</dl></section>
          <section className="rounded-2xl border border-line-soft bg-surface p-6"><p className="mz-overline">Aktivitas</p><p className="mt-3 text-3xl font-bold text-ink">{organization.campaigns.length}</p><p className="mt-1 text-sm text-ink-muted">campaign aktif</p><p className="mt-5 text-sm leading-6 text-ink-muted">Donatur dapat memeriksa setiap campaign dan jejak penyalurannya di Mizan.</p></section>
        </div>

        <section className="mt-12"><p className="mz-overline">Campaign organisasi</p><h2 className="mt-3 text-h2 text-ink">Campaign aktif yang dikelola</h2>{organization.campaigns.length > 0 ? <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">{organization.campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-8 text-center text-sm text-ink-muted">Belum ada campaign aktif.</div>}</section>
        <DisbursementHistory items={organization.disbursementHistory} title="Histori penyaluran organisasi" />
      </section>
    </main>
    <SiteFooter />
  </>
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) { return <div className="flex gap-2 text-sm"><span className="mt-0.5 text-brand-violet">{icon}</span><div><p className="text-xs text-ink-muted">{label}</p><p className="mt-1 break-words text-ink">{value}</p></div></div> }
function Row({ label, value }: { label: string; value: ReactNode }) { return <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between"><dt className="text-sm text-ink-muted">{label}</dt><dd className="text-sm text-ink sm:text-right">{value}</dd></div> }
