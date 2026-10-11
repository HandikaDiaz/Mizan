import { NextResponse } from "next/server"
import { z } from "zod"
import { getPrivyProfile } from "@/src/lib/privy/user-data"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { db } from "@/src/prisma/db"

const inputSchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  donorWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountWei: z.string().regex(/^[1-9]\d*$/),
  idempotencyKey: z.string().trim().min(8).max(120),
})

export async function POST(request: Request) {
  try {
    const identityToken = request.headers.get("privy-id-token")
    if (!identityToken) return error("IDENTITY_TOKEN_REQUIRED", 401)

    const input = inputSchema.parse(await request.json())
    const privyUser = await getPrivyUserFromIdentityToken(identityToken)
    const profile = getPrivyProfile(privyUser)
    const donorWallet = input.donorWallet.toLowerCase()
    const linkedWallet = profile.wallets.some(
      (wallet) =>
        wallet.chainType === "ethereum" && wallet.address === donorWallet
    )
    if (!linkedWallet) return error("WALLET_NOT_LINKED", 403)

    const user = await db.orm.public.User.where({
      privyId: profile.privyId,
    }).first()
    if (!user) return error("USER_NOT_SYNCED", 404)

    const campaign = await db.orm.public.Campaign.first({
      id: input.campaignId,
    })
    if (!campaign) return error("CAMPAIGN_NOT_FOUND", 404)
    if (campaign.reviewStatus !== "APPROVED" || campaign.status !== "ACTIVE") {
      return error("CAMPAIGN_NOT_ACTIVE", 409)
    }

    const existing = await db.orm.public.CampaignPayment.first({
      idempotencyKey: input.idempotencyKey,
    })
    if (existing) {
      if (
        existing.campaignId !== input.campaignId ||
        existing.donorId !== user.id ||
        existing.amountWei !== input.amountWei
      ) {
        return error("IDEMPOTENCY_KEY_REUSED", 409)
      }
      return NextResponse.json({
        ok: true,
        payment: serializePayment(existing),
        idempotent: true,
      })
    }

    const wallet = await db.orm.public.UserWallet.where({
      userId: user.id,
      address: donorWallet,
      chainType: "ethereum",
    }).first()
    if (!wallet) return error("WALLET_NOT_SYNCED", 409)

    const payment = await db.orm.public.CampaignPayment.create({
      campaignId: input.campaignId,
      donorId: user.id,
      donorWallet,
      amountWei: input.amountWei,
      mode: "MOCK",
      status: "CONFIRMED",
      transactionHash: null,
      idempotencyKey: input.idempotencyKey,
    })

    const totalFundedWei = await getCampaignTotalWei(input.campaignId)
    return NextResponse.json({
      ok: true,
      payment: serializePayment(payment),
      totalFundedWei,
    })
  } catch (error) {
    if (error instanceof z.ZodError)
      return errorResponse("INVALID_PAYMENT", 422)
    console.error("Mock payment failed", error)
    return errorResponse("MOCK_PAYMENT_FAILED", 500)
  }
}

async function getCampaignTotalWei(campaignId: number) {
  const payments = await db.orm.public.CampaignPayment.where({
    campaignId,
  }).all()
  return payments
    .filter((payment) => payment.status === "CONFIRMED")
    .reduce((total, payment) => total + BigInt(payment.amountWei), BigInt(0))
    .toString()
}

function serializePayment(payment: {
  id: number
  campaignId: number
  amountWei: string
  mode: "MOCK" | "ONCHAIN"
  status: "PENDING" | "CONFIRMED" | "FAILED"
  transactionHash: string | null
  idempotencyKey: string
}) {
  return {
    id: payment.id,
    campaignId: payment.campaignId,
    amountWei: payment.amountWei,
    mode: payment.mode,
    status: payment.status,
    transactionHash: payment.transactionHash,
    idempotencyKey: payment.idempotencyKey,
  }
}

function error(code: string, status: number) {
  return errorResponse(code, status)
}

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, error: code }, { status })
}
