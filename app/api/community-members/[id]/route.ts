import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/src/prisma/db"
import { getSession } from "@/src/lib/auth"

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "REJECTED"]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSession(req)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const memberId = Number.parseInt(id, 10)

    if (Number.isNaN(memberId)) {
      return NextResponse.json({ error: "ID anggota tidak valid" }, { status: 400 })
    }

    const body = await req.json()
    const validation = updateStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
    }

    const targetMember = await db.orm.public.CommunityMember.where({ id: memberId }).first()
    if (!targetMember) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 })
    }

    // Check if requesting user is an OWNER of targetMember's community
    const requesterMembership = await db.orm.public.CommunityMember.where({
      userId: auth.user.id,
      communityId: targetMember.communityId,
    }).first()

    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Hanya OWNER organisasi yang dapat mengelola keanggotaan" },
        { status: 403 }
      )
    }

    const updatedMember = await db.orm.public.CommunityMember.where({ id: memberId }).update({
      status: validation.data.status,
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Gagal mengupdate status anggota", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate status anggota" },
      { status: 500 }
    )
  }
}
