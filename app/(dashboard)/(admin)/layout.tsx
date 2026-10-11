import { DashboardShell } from "@/components/dashboard/sidebar"
import { ADMIN_NAV } from "@/src/lib/dashboard-data"
import { SITE } from "@/src/lib/site-data"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      role="Admin"
      walletShort={SITE.contractShort}
      walletFull={SITE.contract}
    >
      {children}
    </DashboardShell>
  )
}
