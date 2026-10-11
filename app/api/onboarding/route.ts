import { NextResponse } from "next/server"

import {
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from "@/src/lib/onboarding/profile-schema"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { getPrivyProfile } from "@/src/lib/privy/user-data"
import {
  getOnboardingUserType,
  getRoleForOnboardingUserType,
  type UserRole,
} from "@/src/lib/role-dashboard"
import { db } from "@/src/prisma/db"
import {
  createDashboardSession,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
} from "@/src/lib/auth-session"

const identityTokenFromRequest = (request: Request) =>
  request.headers.get("privy-id-token")

export async function POST(request: Request) {
  try {
    const identityToken = identityTokenFromRequest(request)

    if (!identityToken) {
      return NextResponse.json(
        { ok: false, error: "IDENTITY_TOKEN_REQUIRED" },
        { status: 401 }
      )
    }

    const payload = onboardingProfileSchema.safeParse(
      (await request.json()) as unknown
    )

    if (!payload.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_ONBOARDING_DATA",
          issues: payload.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    const privyUser = await getPrivyUserFromIdentityToken(identityToken)
    const profile = getPrivyProfile(privyUser)
    const currentUser = await db.orm.public.User.where({
      privyId: profile.privyId,
    }).first()

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, error: "USER_NOT_SYNCED" },
        { status: 404 }
      )
    }

    if (currentUser.onboardingCompletedAt !== null) {
      return NextResponse.json(
        { ok: false, error: "ONBOARDING_ALREADY_COMPLETED" },
        { status: 409 }
      )
    }

    const updatedUser = await saveOnboardingProfile(
      currentUser.id,
      currentUser.role,
      payload.data
    )

    if (!updatedUser) {
      return NextResponse.json(
        { ok: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      ok: true,
      onboardingRequired: false,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        userType: updatedUser.userType,
        role: updatedUser.role,
      },
    })

    response.cookies.set({
      name: DASHBOARD_SESSION_COOKIE,
      value: await createDashboardSession({
        privyId: updatedUser.privyId,
        role: updatedUser.role,
        userType: getOnboardingUserType(updatedUser.userType),
      }),
      httpOnly: true,
      maxAge: DASHBOARD_SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Onboarding submission failed", error)

    return NextResponse.json(
      { ok: false, error: "ONBOARDING_SUBMISSION_FAILED" },
      { status: 500 }
    )
  }
}

const saveOnboardingProfile = async (
  userId: number,
  currentRole: UserRole,
  profile: OnboardingProfileInput
) => {
  const now = new Date().toISOString()

  return db.orm.public.User.where({ id: userId }).update({
    username: profile.username,
    role:
      currentRole === "ADMIN"
        ? currentRole
        : getRoleForOnboardingUserType(profile.userType ?? "BENEFACTOR"),
    userType: profile.userType ?? "DONOR",
    domicile: profile.domicile,
    whatsappNumber: profile.whatsappNumber,
    whatsappNotificationConsent: profile.whatsappNotificationConsent,
    referralSource: profile.referralSource,
    referralSourceOther: profile.referralSourceOther ?? null,
    dataConsent: profile.dataConsent,
    dataConsentAt: now,
    dataConsentVersion: "2026-09-14-v1",
    onboardingCompletedAt: now,
  })
}
