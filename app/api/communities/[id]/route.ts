import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/src/prisma/db"
import { getSession } from "@/src/lib/auth"

const profileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  logoUrl: z.string().trim().max(1000).optional().nullable(),
  websiteUrl: z.string().trim().max(500).optional().nullable(),
  contactEmail: z.string().trim().email().max(320).optional().nullable(),
  contactPhone: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  walletAddress: z.string().trim().regex(/^0x[a-fA-F0-9]{40}$/, "Format wallet EVM tidak valid."),
  registrationNumber: z.string().trim().max(160).optional().nullable(),
  legalDocumentUrl: z.string().trim().max(1000).optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getSession(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const communityId = Number((await params).id)
    if (!Number.isInteger(communityId) || communityId <= 0) {
      return NextResponse.json({ error: "ID organisasi tidak valid." }, { status: 400 })
    }

    const membership = await db.orm.public.CommunityMember.where({
      userId: auth.user.id,
      communityId,
      status: "ACTIVE",
      role: "OWNER",
    }).first()
    if (!membership) return NextResponse.json({ error: "Hanya owner organisasi yang dapat mengubah profil." }, { status: 403 })

    const parsed = profileSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Validasi profil gagal.", issues: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = parsed.data
    const community = await db.orm.public.Community.where({ id: communityId }).update({
      name: data.name,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      address: data.address || null,
      walletAddress: data.walletAddress.toLowerCase(),
      registrationNumber: data.registrationNumber || null,
      legalDocumentUrl: data.legalDocumentUrl || null,
    })
    return NextResponse.json(community)
  } catch (error) {
    console.error("Gagal memperbarui profil organisasi", error)
    return NextResponse.json({ error: "Gagal memperbarui profil organisasi." }, { status: 500 })
  }
}
