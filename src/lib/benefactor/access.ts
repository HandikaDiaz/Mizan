import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  DASHBOARD_SESSION_COOKIE,
  readDashboardSession,
} from "@/src/lib/auth-session"
import { db } from "@/src/prisma/db"

/** Guard halaman donatur — mirror `requireBeneficiaryCommunity`. */
export async function requireBenefactorUser() {
  const cookieStore = await cookies()
  const session = await readDashboardSession(
    cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value,
  )

  if (!session || session.role !== "BENEFACTOR") {
    redirect("/")
  }

  const user = await db.orm.public.User.where({
    privyId: session.privyId,
  }).first()

  if (!user || user.role !== "BENEFACTOR") {
    redirect("/")
  }

  return { session, user }
}
