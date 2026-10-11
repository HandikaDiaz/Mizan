import { NextResponse } from "next/server"

import { getPrivyProfile } from "@/src/lib/privy/user-data"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { db } from "@/src/prisma/db"

export async function GET(request: Request) {
  try {
    const identityToken = request.headers.get("privy-id-token")
    if (!identityToken) return errorResponse("IDENTITY_TOKEN_REQUIRED", 401)

    const profile = getPrivyProfile(
      await getPrivyUserFromIdentityToken(identityToken)
    )
    const user = await db.orm.public.User.where({
      privyId: profile.privyId,
    }).first()
    if (!user) return errorResponse("USER_NOT_SYNCED", 404)

    const payments = await db.orm.public.CampaignPayment.where({
      donorId: user.id,
    }).all()
    const rows = await Promise.all(
      payments.map(async (payment) => {
        const campaign = await db.orm.public.Campaign.first({
          id: payment.campaignId,
        })
        return {
          id: payment.id,
          campaignId: payment.campaignId,
          campaignTitle: campaign?.title ?? `Campaign #${payment.campaignId}`,
          amountWei: payment.amountWei,
          mode: payment.mode,
          status: payment.status,
          transactionHash: payment.transactionHash,
          createdAt: payment.createdAt,
        }
      })
    )

    return NextResponse.json({ ok: true, payments: rows })
  } catch (error) {
    console.error("Payment history failed", error)
    return errorResponse("PAYMENT_HISTORY_FAILED", 500)
  }
}

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, error: code }, { status })
}
