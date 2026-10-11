import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/src/prisma/db"
import { getSession } from "@/src/lib/auth"
import {
  createDashboardSession,
  DASHBOARD_SESSION_COOKIE,
  DASHBOARD_SESSION_MAX_AGE,
} from "@/src/lib/auth-session"

const joinSchema = z.object({
  inviteCode: z.string().trim().min(1, "Kode undangan wajib diisi"),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = joinSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Kode undangan tidak valid" },
        { status: 400 }
      )
    }

    const inviteCode = validation.data.inviteCode.toUpperCase()

    const community = await db.orm.public.Community.where({ inviteCode }).first()
    if (!community) {
      return NextResponse.json(
        { error: "Kode tidak ditemukan, cek lagi dengan admin lembaga kamu" },
        { status: 404 }
      )
    }

    const existingMember = await db.orm.public.CommunityMember.where({
      userId: auth.user.id,
      communityId: community.id,
    }).first()

    let memberStatus: "PENDING" | "ACTIVE" | "REJECTED" = "PENDING"

    if (existingMember) {
      memberStatus = existingMember.status as "PENDING" | "ACTIVE" | "REJECTED"
    } else {
      await db.orm.public.CommunityMember.create({
        userId: auth.user.id,
        communityId: community.id,
        role: "STAFF",
        status: "PENDING",
      })
    }

    const now = new Date().toISOString()
    await db.orm.public.User.where({ id: auth.user.id }).update({
      role: "BENEFICIARY",
      onboardingCompletedAt: now,
    })

    const response = NextResponse.json({
      ok: true,
      community: {
        id: community.id,
        name: community.name,
      },
      status: memberStatus,
    })

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
    console.error("Gagal bergabung ke komunitas", error)
    return NextResponse.json(
      { error: "Gagal memproses permintaan bergabung" },
      { status: 500 }
    )
  }
}
