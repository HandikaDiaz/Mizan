import { NextResponse } from "next/server"
import { z } from "zod"

import { getPrivyProfile } from "@/src/lib/privy/user-data"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { db } from "@/src/prisma/db"
import { getOnboardingUserType } from "@/src/lib/role-dashboard"
import {
  createDashboardSession,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
} from "@/src/lib/auth-session"

const identityTokenSchema = z.string().trim().min(1)

export async function POST(request: Request) {
  try {
    const identityToken = identityTokenSchema.parse(
      request.headers.get("privy-id-token")
    )
    const privyUser = await getPrivyUserFromIdentityToken(identityToken)
    const profile = getPrivyProfile(privyUser)

    const user = await syncUserWithRetry(profile)

    const response = NextResponse.json({
      ok: true,
      onboardingRequired: user.onboardingCompletedAt === null,
      user: {
        id: user.id,
        privyId: user.privyId,
        email: user.email,
        role: user.role,
        userType: getOnboardingUserType(user.userType),
      },
    })

    response.cookies.set({
      name: DASHBOARD_SESSION_COOKIE,
      value: await createDashboardSession({
        privyId: user.privyId,
        role: user.role,
        userType: getOnboardingUserType(user.userType),
      }),
      httpOnly: true,
      maxAge: DASHBOARD_SESSION_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "IDENTITY_TOKEN_REQUIRED" },
        { status: 401 }
      )
    }

    const isLocalDatabaseUnavailable =
      process.env.NODE_ENV === "development" &&
      error instanceof Error &&
      /ECONNREFUSED|P1001|connect/i.test(error.message)

    if (isLocalDatabaseUnavailable) {
      return NextResponse.json({
        ok: true,
        syncSkipped: true,
        onboardingRequired: false,
      })
    }

    console.error("Privy user sync failed", error)

    return NextResponse.json(
      {
        ok: false,
        error: "AUTH_SYNC_FAILED",
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { details: error.message }
          : {}),
      },
      { status: 500 }
    )
  }
}

const syncUserWithRetry = async (
  profile: ReturnType<typeof getPrivyProfile>
) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await db.transaction(async (transaction) => {
        const existingUser = await transaction.orm.public.User.where({
          privyId: profile.privyId,
        }).first()
        const syncedUser = existingUser
          ? await transaction.orm.public.User.where({
              id: existingUser.id,
            }).update({ email: profile.email })
          : await transaction.orm.public.User.create({
              privyId: profile.privyId,
              email: profile.email,
              role: "BENEFACTOR",
            })

        if (!syncedUser) {
          throw new Error("AUTH_SYNC_USER_NOT_FOUND_AFTER_WRITE")
        }

        for (const wallet of profile.wallets) {
          const existingWallet = await transaction.orm.public.UserWallet.where({
            userId: syncedUser.id,
            address: wallet.address,
            chainType: wallet.chainType,
          }).first()

          if (existingWallet) {
            await transaction.orm.public.UserWallet.where({
              id: existingWallet.id,
            }).update({
              walletType: wallet.walletType,
              privyWalletId: wallet.privyWalletId,
            })
          } else {
            await transaction.orm.public.UserWallet.create({
              userId: syncedUser.id,
              address: wallet.address,
              chainType: wallet.chainType,
              walletType: wallet.walletType,
              privyWalletId: wallet.privyWalletId,
            })
          }
        }

        return syncedUser
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      const isPrivyIdConflict = errorMessage.includes("user_privyId_key")

      if (!isPrivyIdConflict || attempt === 1) {
        throw error
      }
    }
  }

  throw new Error("AUTH_SYNC_RETRY_EXHAUSTED")
}
