import type { Metadata } from "next"
import { getAdminDisbursements } from "./actions"
import { AdminDisbursementTable } from "@/components/dashboard/admin-disbursement-table"
import { LocalizedText } from "@/components/dashboard/localized-text"

export const metadata: Metadata = { title: "Penyaluran — Panel Admin" }
export const dynamic = "force-dynamic"

export default async function AdminPenyaluranPage() {
  const items = await getAdminDisbursements()
  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-8">
        <p className="mz-overline">
          <LocalizedText text="Panel Admin" />
        </p>
        <h1 className="mt-3 text-h1 text-ink">
          <LocalizedText text="Penyaluran dana" />
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Periksa bukti penggunaan dana, hasil verifikasi AI, dan proses
          pencairan milestone.
        </p>
      </div>
      <AdminDisbursementTable items={items} />
    </div>
  )
}
