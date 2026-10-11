import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/src/lib/auth"
import { generateDisbursementDocx } from "@/src/lib/disbursement-document"
import { db } from "@/src/prisma/db"

export async function GET(request: NextRequest) {
  try {
    const auth = await getSession(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const milestoneId = Number(request.nextUrl.searchParams.get("milestoneId"))
    // opsional: prefill kolom "Tujuan penggunaan dana"; dibatasi 2000 karakter (sama dengan skema validasi)
    const proofNote = request.nextUrl.searchParams.get("proofNote")?.trim().slice(0, 2000) ?? ""
    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
      return NextResponse.json({ error: "Milestone tidak valid." }, { status: 400 })
    }

    const membership = await db.orm.public.CommunityMember.where({ userId: auth.user.id, status: "ACTIVE" }).first()
    const milestone = await db.orm.public.Milestone.first({ id: milestoneId })
    if (!membership || !milestone) return NextResponse.json({ error: "Akses atau milestone tidak ditemukan." }, { status: 404 })
    const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
    const community = await db.orm.public.Community.first({ id: membership.communityId })
    const user = await db.orm.public.User.first({ id: auth.user.id })
    if (!campaign || campaign.communityId !== membership.communityId || !community || !user) {
      return NextResponse.json({ error: "Akses ke milestone ditolak." }, { status: 403 })
    }

    const bytes = await generateDisbursementDocx({
      organizationName: community.name,
      registrationNumber: community.registrationNumber,
      campaignTitle: campaign.title,
      milestoneDescription: milestone.description,
      walletAddress: community.walletAddress,
      requestedAmountWei: milestone.amountWei,
      currency: campaign.currency,
      description: proofNote,
      region: "", // dikosongkan: diisi sendiri oleh pengaju (lokasi belanja belum tentu sama dengan alamat organisasi)
      requesterName: user.name || user.email || "Perwakilan organisasi",
      requestDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }),
      items: [], // template kosong: rincian item & harga diisi sendiri oleh pengaju
    })

    return new NextResponse(bytes as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="template-pengajuan-dana-milestone-${milestone.id}.docx"`,
      },
    })
  } catch (error) {
    console.error("Gagal membuat template pengajuan pencairan dana", error)
    return NextResponse.json({ error: "Gagal membuat template dokumen." }, { status: 500 })
  }
}