import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import {
  DASHBOARD_SESSION_COOKIE,
  readDashboardSession,
  type DashboardSession,
} from "@/src/lib/auth-session"
import { db } from "@/src/prisma/db"

export type SessionResult = {
  user: {
    id: number
    privyId: string
    email: string | null
    role: string
    onboardingCompletedAt: string | null
  }
  session: DashboardSession
}

export async function getSession(
  req?: NextRequest | Request
): Promise<SessionResult | null> {
  let cookieValue: string | undefined

  if (req) {
    const cookieHeader = req.headers.get("cookie") || ""
    const match = cookieHeader.match(
      new RegExp(`(?:^|; )\\s*${DASHBOARD_SESSION_COOKIE}=([^;]*)`)
    )
    if (match) {
      cookieValue = decodeURIComponent(match[1])
    }
  }

  if (!cookieValue) {
    try {
      const cookieStore = await cookies()
      cookieValue = cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value
    } catch {
      // Ignore when cookies() is not available
    }
  }

  const session = await readDashboardSession(cookieValue)
  if (!session) {
    return null
  }

  const user = await db.orm.public.User.where({ privyId: session.privyId }).first()
  if (!user) {
    return null
  }

  return { user, session }
}
