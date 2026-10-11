import { NextRequest, NextResponse } from "next/server"
import { db } from "@/src/prisma/db"
import { getSession } from "@/src/lib/auth"
import { onboardingProfileSchema } from "@/src/lib/onboarding/profile-schema"
import {
  createDashboardSession,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
} from "@/src/lib/auth-session"

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = onboardingProfileSchema.safeParse(body)

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Validasi data gagal"
      return NextResponse.json(
        { error: firstError, issues: fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if username is already taken by another user
    const existingUsername = await db.orm.public.User.where({ username: data.username }).first()
    if (existingUsername && existingUsername.id !== auth.user.id) {
      return NextResponse.json(
        { error: "Username sudah digunakan. Silakan pilih username lain." },
        { status: 400 }
      )
    }

    const selectedRole = data.role
    const now = new Date().toISOString()
    const userType = selectedRole === "BENEFICIARY" ? "BENEFICIARY" : "DONOR"

    if (selectedRole === "BENEFACTOR") {
      await db.orm.public.User.where({ id: auth.user.id }).update({
        role: "BENEFACTOR",
        userType,
        name: data.name,
        username: data.username,
        domicile: data.domicile,
        whatsappNumber: data.whatsappNumber,
        whatsappNotificationConsent: data.whatsappNotificationConsent,
        referralSource: data.referralSource,
        referralSourceOther: data.referralSourceOther,
        onboardingCompletedAt: now,
      })

      const response = NextResponse.json({ ok: true, role: "BENEFACTOR", completed: true })
      response.cookies.set({
        name: DASHBOARD_SESSION_COOKIE,
        value: await createDashboardSession({
          privyId: auth.user.privyId,
          role: "BENEFACTOR",
          userType: "DONOR",
        }),
        httpOnly: true,
        maxAge: DASHBOARD_SESSION_MAX_AGE,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      return response
    } else {
      await db.orm.public.User.where({ id: auth.user.id }).update({
        role: "BENEFICIARY",
        userType,
        name: data.name,
        username: data.username,
        domicile: data.domicile,
        whatsappNumber: data.whatsappNumber,
        whatsappNotificationConsent: data.whatsappNotificationConsent,
        referralSource: data.referralSource,
        referralSourceOther: data.referralSourceOther,
      })

      const response = NextResponse.json({ ok: true, role: "BENEFICIARY", completed: false })
      response.cookies.set({
        name: DASHBOARD_SESSION_COOKIE,
        value: await createDashboardSession({
          privyId: auth.user.privyId,
          role: "BENEFICIARY",
          userType: "BENEFICIARY",
        }),
        httpOnly: true,
        maxAge: DASHBOARD_SESSION_MAX_AGE,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      return response
    }
  } catch (error) {
    console.error("Gagal memperbarui profil pengguna saat onboarding", error)
    return NextResponse.json(
      { error: "Gagal menyimpan data profil" },
      { status: 500 }
    )
  }
}

