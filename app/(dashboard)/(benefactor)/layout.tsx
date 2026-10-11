import { DashboardShell } from "@/components/dashboard/sidebar"
import { BENEFACTOR_NAV, BENEFACTOR_WALLET } from "@/src/lib/dashboard-data"

export default function BenefactorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navItems={BENEFACTOR_NAV}
      role="Donatur"
      walletShort={BENEFACTOR_WALLET.addressShort}
      walletFull={BENEFACTOR_WALLET.address}
    >
      {children}
    </DashboardShell>
  )
}
