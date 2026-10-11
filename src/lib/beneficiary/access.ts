import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DASHBOARD_SESSION_COOKIE, readDashboardSession } from "@/src/lib/auth-session"
import { db } from "@/src/prisma/db"

export async function requireBeneficiaryCommunity() {
  const cookieStore = await cookies()
  const session = await readDashboardSession(cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value)

  if (!session || (session.role !== "BENEFICIARY" && session.role !== "ADMIN")) {
    redirect("/")
  }

  let user = await db.orm.public.User.where({ privyId: session.privyId }).first()
  if (!user) {
    user = session.role === "ADMIN"
      ? await db.orm.public.User.where({ role: "ADMIN" }).first()
      : await db.orm.public.User.where({ role: "BENEFICIARY" }).first()
  }

  if (!user) {
    redirect("/")
  }

  // Admin bypass
  if (session.role === "ADMIN") {
    const allCommunities = await db.orm.public.Community.all()
    const community = allCommunities[0] ?? null
    if (!community) {
      throw new Error("Tidak ada organisasi di sistem.")
    }
    return { session, user, community, memberRole: "OWNER" as const }
  }

  // Find ACTIVE membership
  const activeMembership = await db.orm.public.CommunityMember.where({
    userId: user.id,
    status: "ACTIVE",
  }).first()

  if (!activeMembership) {
    // Check if user has a PENDING membership
    const pendingMembership = await db.orm.public.CommunityMember.where({
      userId: user.id,
      status: "PENDING",
    }).first()

    if (pendingMembership) {
      redirect("/beneficiary/pending")
    }

    // No membership at all
    redirect("/onboarding/community")
  }

  const community = await db.orm.public.Community.where({ id: activeMembership.communityId }).first()
  if (!community) {
    redirect("/onboarding/community")
  }

  return { session, user, community, memberRole: activeMembership.role }
}

export async function getBeneficiaryCommunityOrNull() {
  try {
    return await requireBeneficiaryCommunity()
  } catch (error) {
    console.error("getBeneficiaryCommunityOrNull error:", error)
    return null
  }
}

export async function requireAdminSession() {
  const cookieStore = await cookies()
  const session = await readDashboardSession(cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value)

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  const user = await db.orm.public.User.where({ privyId: session.privyId }).first()
  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return { session, user }
}
