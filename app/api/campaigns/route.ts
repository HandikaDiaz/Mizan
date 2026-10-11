import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { DASHBOARD_SESSION_COOKIE, readDashboardSession } from "@/src/lib/auth-session"
import { campaignInputSchema } from "@/src/lib/beneficiary/validation"
import { db } from "@/src/prisma/db"

export async function POST(request: Request) {
  try {
    const session = await readDashboardSession((await cookies()).get(DASHBOARD_SESSION_COOKIE)?.value)
    if (!session || session.role !== "BENEFICIARY") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await db.orm.public.User.where({ privyId: session.privyId }).first()
    const activeMembership = user ? await db.orm.public.CommunityMember.where({ userId: user.id, status: "ACTIVE" }).first() : null
    const community = activeMembership ? await db.orm.public.Community.where({ id: activeMembership.communityId }).first() : null

    if (!user || user.role !== "BENEFICIARY" || !community) return NextResponse.json({ error: "Akun ini belum terhubung ke organisasi manapun." }, { status: 403 })
    const parsed = campaignInputSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Input kampanye tidak valid.", details: parsed.error.flatten() }, { status: 400 })
    const campaign = await db.transaction(async (transaction) => {
      const created = await transaction.orm.public.Campaign.create({
        title: parsed.data.title,
        organizerName: community.name,
        communityId: community.id,
        category: parsed.data.category,
        source: "MANUAL",
        reviewStatus: "PENDING_REVIEW",
        status: "ACTIVE",
        recipientWallet: parsed.data.recipientWallet.toLowerCase(),
        targetAmountWei: parsed.data.targetAmountWei,
        currency: parsed.data.currency,
        aiDraft: { description: parsed.data.description },
        image: parsed.data.image || null,
        location: parsed.data.location || null,
        summary: parsed.data.description,
        daysLeft: parsed.data.daysLeft,
        fundingDeadline: new Date(Date.now() + parsed.data.daysLeft * 24 * 60 * 60 * 1000).toISOString(),
      })
      await Promise.all(parsed.data.milestones.map((milestone, index) =>
        transaction.orm.public.Milestone.create({
          campaignId: created.id,
          order: index + 1,
          description: milestone.description,
          amountWei: milestone.amountWei,
          status: "PENDING",
        }),
      ))
      return created
    })
    return NextResponse.json({ ...campaign, source: "MANUAL", reviewStatus: "PENDING_REVIEW" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat kampanye." }, { status: 500 })
  }
}
