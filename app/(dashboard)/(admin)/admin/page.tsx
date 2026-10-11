import type { Metadata } from "next"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { CampaignRow } from "@/components/dashboard/campaign-row"
import {
  getAdminStats,
  getAdminActivities,
} from "@/src/lib/admin-dashboard-server"
import { getCampaigns } from "./campaigns/actions"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Panel Admin",
}

// Admin dashboard reflects live data on every request.
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const [campaigns, stats, activities] = await Promise.all([
    getCampaigns(),
    getAdminStats(),
    getAdminActivities(),
  ])
  return (
    <div className="mx-auto max-w-310">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">
          <LocalizedText text="Panel Admin" />
        </p>
        <h1 className="mt-3 text-h1 text-ink">
          <LocalizedText text="Ringkasan Platform" />
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Stat cards — 4 kolom di desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            stat={stat}
            isCurrency={stat.unit === "BNB" || stat.unit === "USDT"}
          />
        ))}
      </div>

      {/* Kampanye menunggu peninjauan */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">
          <LocalizedText text="Kampanye" />
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Daftar kampanye beserta status peninjauan.
        </p>
        <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-ink-muted">
              Belum ada kampanye.
            </p>
          )}
        </div>
      </section>

      {/* Aktivitas terbaru */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">
          <LocalizedText text="Aktivitas terbaru" />
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Transaksi dan kejadian terakhir di platform.
        </p>
        <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
          {activities.length > 0 ? (
            activities.map((item) => <ActivityRow key={item.id} item={item} />)
          ) : (
            <p className="py-8 text-center text-sm text-ink-muted">
              Belum ada aktivitas. Transaksi dan kampanye baru akan muncul di
              sini.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
