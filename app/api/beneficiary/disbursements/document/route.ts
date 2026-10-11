import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/src/lib/auth"
import { disbursementRequestInputSchema } from "@/src/lib/disbursement"
import { validateRequestAmount, validateRequestItems } from "@/src/lib/disbursement-validation"
import { generateDisbursementDocx } from "@/src/lib/disbursement-document"
import { canGenerateMilestoneTemplate } from "@/src/lib/milestone-management"
import { db } from "@/src/prisma/db"

export async function POST(request: NextRequest) {
  try {
    const auth = await getSession(request)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body: unknown = await request.json()
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 })
    const value = body as Record<string, unknown>
    const milestoneId = Number(value.milestoneId)
    const membership = await db.orm.public.CommunityMember.where({ userId: auth.user.id, status: "ACTIVE" }).first()
    const milestone = Number.isInteger(milestoneId) ? await db.orm.public.Milestone.first({ id: milestoneId }) : null
    if (!membership || !milestone) return NextResponse.json({ error: "Akses atau milestone tidak ditemukan." }, { status: 404 })
    const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
    const community = await db.orm.public.Community.first({ id: membership.communityId })
    const user = await db.orm.public.User.first({ id: auth.user.id })
    if (!campaign || campaign.communityId !== membership.communityId || !community || !user) {
      return NextResponse.json({ error: "Akses ke milestone ditolak." }, { status: 403 })
    }
    if (!canGenerateMilestoneTemplate(milestone)) {
      return NextResponse.json({ error: "Template hanya dapat dibuat untuk milestone terkunci yang belum diajukan." }, { status: 400 })
    }
    const parsed = disbursementRequestInputSchema.safeParse({
      requestedAmountWei: value.requestedAmountWei,
      description: value.description,
      region: value.region,
      items: value.items,
    })
    if (!parsed.success) return NextResponse.json({ error: "Data pengajuan tidak valid." }, { status: 400 })
    if (!validateRequestAmount(milestone.amountWei, parsed.data.requestedAmountWei)) {
      return NextResponse.json({ error: "Nominal harus sama persis dengan nominal milestone." }, { status: 422 })
    }
    if (!validateRequestItems(parsed.data.items, milestone.amountWei)) {
      return NextResponse.json({ error: "Total rincian item harus sama persis dengan nominal milestone." }, { status: 422 })
    }
    const bytes = await generateDisbursementDocx({
      organizationName: community.name,
      registrationNumber: community.registrationNumber,
      campaignTitle: campaign.title,
      milestoneDescription: milestone.description,
      walletAddress: community.walletAddress,
      requestedAmountWei: parsed.data.requestedAmountWei,
      currency: campaign.currency,
      description: parsed.data.description,
      region: parsed.data.region,
      requesterName: user.name || user.email || "Perwakilan organisasi",
      requestDate: new Date().toISOString().slice(0, 10),
      items: parsed.data.items,
    })
    return new NextResponse(bytes as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="pengajuan-pencairan-${milestone.id}.docx"`,
      },
    })
  } catch (error) {
    console.error("Gagal membuat template pencairan", error)
    return NextResponse.json({ error: "Gagal membuat template dokumen." }, { status: 500 })
  }
}
