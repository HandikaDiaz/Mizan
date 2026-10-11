import { DashboardShell } from "@/components/dashboard/sidebar"
import { BENEFICIARY_NAV, BENEFICIARY_WALLET } from "@/src/lib/dashboard-data"

export default function BeneficiaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navItems={BENEFICIARY_NAV}
      role="Penerima"
      walletShort={BENEFICIARY_WALLET.addressShort}
      walletFull={BENEFICIARY_WALLET.address}
    >
      {children}
    </DashboardShell>
  )
}
