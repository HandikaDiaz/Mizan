import type { Metadata } from "next"

import { CampaignPayment, type PaymentCampaign } from "@/components/dashboard/campaign-payment"
import { PaymentHistory } from "@/components/dashboard/payment-history"
import { StatCard } from "@/components/dashboard/stat-card"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { formatWeiBnb, getLiveCampaignSnapshots } from "@/src/lib/dashboard-server"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = {
  title: "Dashboard Donatur",
}

export default async function DonaturPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>
}) {
  const { campaignId } = await searchParams
  const campaigns = await getLiveCampaignSnapshots()
  const activeCampaigns: PaymentCampaign[] = campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    organizerName: campaign.organizerName,
    targetAmountWei: campaign.targetAmountWei,
    fundedAmountWei: campaign.fundedAmountWei,
    recipientWallet: campaign.recipientWallet,
    contractAddress: campaign.contractAddress,
    contractCampaignId: campaign.contractCampaignId,
    chainId: campaign.chainId,
    onchainStatus: campaign.onchainStatus,
  }))
  const totalFundedWei = campaigns
    .reduce((total, campaign) => total + BigInt(campaign.fundedAmountWei), BigInt(0))
    .toString()
  const paymentCount = campaigns.reduce((total, campaign) => total + campaign.paymentCount, 0)

  const stats = [
    { label: "Total terkumpul", value: formatWeiBnb(totalFundedWei).replace(".", ","), unit: "BNB", icon: "Wallet" },
    { label: "Kampanye aktif", value: String(campaigns.length), unit: "kampanye", icon: "Megaphone" },
    { label: "Payment terkonfirmasi", value: String(paymentCount), unit: "payment", icon: "Users" },
  ] as const

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-8">
        <p className="mz-overline"><LocalizedText text="Donatur" /></p>
        <h1 className="mt-3 text-h1 text-ink"><LocalizedText text="Ringkasan Donasi" /></h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isCurrency={stat.unit === "BNB"} />
        ))}
      </div>

      <section className="mt-8">
        <CampaignPayment campaigns={activeCampaigns} initialCampaignId={campaignId} />
      </section>

      <section className="mt-12">
        <h2 className="text-h3 text-ink"><LocalizedText text="Kampanye aktif" /></h2>
        <p className="mt-1 text-sm text-ink-muted">
          <LocalizedText text="Progres dihitung dari CampaignPayment berstatus CONFIRMED di database." />
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {campaigns.length === 0 ? (
            <p className="rounded-2xl border border-line-soft bg-surface p-5 text-sm text-ink-muted">
              <LocalizedText text="Belum ada campaign aktif yang disetujui admin." />
            </p>
          ) : campaigns.map((campaign) => {
            const target = BigInt(campaign.targetAmountWei || "0")
            const funded = BigInt(campaign.fundedAmountWei)
            const percent = target > BigInt(0) ? Math.min(100, Number((funded * BigInt(100)) / target)) : 0

            return (
              <div key={campaign.id} className="rounded-2xl border border-line-soft bg-surface p-5">
                <p className="text-sm font-semibold leading-[1.3] text-ink">{campaign.title}</p>
                <p className="mt-1 text-xs text-ink-muted">{campaign.organizerName}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
                    <div className="h-full rounded-full bg-brand-700" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">{percent}%</span>
                </div>
                <p className="mt-3 font-mono text-sm tabular-nums text-ink">
                  {formatWeiBnb(campaign.fundedAmountWei).replace(".", ",")} / {formatWeiBnb(campaign.targetAmountWei).replace(".", ",")} BNB
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 text-ink"><LocalizedText text="Riwayat transaksi wallet" /></h2>
        <p className="mt-1 text-sm text-ink-muted"><LocalizedText text="Payment MOCK dan ONCHAIN milik wallet Privy yang sedang login." /></p>
        <PaymentHistory />
      </section>
    </div>
  )
}
