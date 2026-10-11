import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/src/prisma/db"
import { getSession } from "@/src/lib/auth"
import { generateInviteCode } from "@/src/lib/invite-code"
import {
  createDashboardSession,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
} from "@/src/lib/auth-session"

const communitySchema = z.object({
  name: z.string().trim().min(1, "Nama lembaga tidak boleh kosong"),
  walletAddress: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional().nullable(),
  legalDocumentUrl: z.string().trim().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = communitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          issues: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, walletAddress, registrationNumber, legalDocumentUrl } = validation.data
    const ownerWallet = await db.orm.public.UserWallet
      .where({ userId: auth.user.id })
      .orderBy((wallet) => wallet.createdAt.asc())
      .first()
    const selectedWallet = walletAddress || ownerWallet?.address || ""
    if (!/^0x[a-fA-F0-9]{40}$/.test(selectedWallet)) {
      return NextResponse.json(
        { error: "Wallet owner belum tersinkron. Hubungkan wallet terlebih dahulu." },
        { status: 400 },
      )
    }
    const inviteCode = generateInviteCode(7)

    const community = await db.orm.public.Community.create({
      name,
      walletAddress: selectedWallet.toLowerCase(),
      registrationNumber: registrationNumber || null,
      legalDocumentUrl: legalDocumentUrl || null,
      inviteCode,
      chainType: "BSC_TESTNET",
      verificationStatus: "PENDING",
    })

    await db.orm.public.CommunityMember.create({
      userId: auth.user.id,
      communityId: community.id,
      role: "OWNER",
      status: "ACTIVE",
    })

    const now = new Date().toISOString()
    await db.orm.public.User.where({ id: auth.user.id }).update({
      role: "BENEFICIARY",
      onboardingCompletedAt: now,
    })

    const response = NextResponse.json({ ...community, walletAddress: selectedWallet.toLowerCase() }, { status: 201 })

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
  } catch (error) {
    console.error("Gagal membuat komunitas", error)
    return NextResponse.json(
      { error: "Gagal membuat komunitas baru" },
      { status: 500 }
    )
  }
}
