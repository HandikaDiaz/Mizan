import { NextResponse } from "next/server"
import { isAddress, type Address, type Hex } from "viem"
import { z } from "zod"

import { getPublicClient } from "@/src/lib/chain/client"
import { getChainConfig } from "@/src/lib/chain/config"
import { BSC_TESTNET_CHAIN_ID } from "@/src/lib/chain/constants"
import { decodeFundsCommittedReceipt } from "@/src/lib/chain/vault-service"
import { getPrivyProfile } from "@/src/lib/privy/user-data"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { db } from "@/src/prisma/db"

const inputSchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  donorWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountWei: z.string().regex(/^[1-9]\d*$/),
  idempotencyKey: z.string().trim().min(8).max(120),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
})

export async function POST(request: Request) {
  try {
    const identityToken = request.headers.get("privy-id-token")
    if (!identityToken) return errorResponse("IDENTITY_TOKEN_REQUIRED", 401)

    const input = inputSchema.parse(await request.json())
    const privyUser = await getPrivyUserFromIdentityToken(identityToken)
    const profile = getPrivyProfile(privyUser)
    const donorWallet = input.donorWallet.toLowerCase()
    const linkedWallet = profile.wallets.some(
      (wallet) => wallet.chainType === "ethereum" && wallet.address === donorWallet,
    )
    if (!linkedWallet) return errorResponse("WALLET_NOT_LINKED", 403)

    const user = await db.orm.public.User.where({ privyId: profile.privyId }).first()
    if (!user) return errorResponse("USER_NOT_SYNCED", 404)

    const campaign = await db.orm.public.Campaign.first({ id: input.campaignId })
    if (!campaign) return errorResponse("CAMPAIGN_NOT_FOUND", 404)
    if (campaign.reviewStatus !== "APPROVED" || campaign.status !== "ACTIVE") {
      return errorResponse("CAMPAIGN_NOT_ACTIVE", 409)
    }
    if (
      campaign.onchainStatus !== "REGISTERED" ||
      campaign.chainId !== BSC_TESTNET_CHAIN_ID ||
      !campaign.contractAddress ||
      !isAddress(campaign.contractAddress) ||
      !campaign.contractCampaignId ||
      !/^\d+$/.test(campaign.contractCampaignId)
    ) {
      return errorResponse("CAMPAIGN_NOT_REGISTERED_ONCHAIN", 409)
    }

    const config = getChainConfig()
    if (campaign.contractAddress.toLowerCase() !== config.contractAddress.toLowerCase()) {
      return errorResponse("CAMPAIGN_CONTRACT_MISMATCH", 409)
    }

    const existingByKey = await db.orm.public.CampaignPayment.first({
      idempotencyKey: input.idempotencyKey,
    })
    if (existingByKey) {
      if (!matchesPayment(existingByKey, input, user.id, donorWallet)) {
        return errorResponse("IDEMPOTENCY_KEY_REUSED", 409)
      }
      return NextResponse.json({
        ok: true,
        payment: serializePayment(existingByKey),
        idempotent: true,
        totalFundedWei: await getCampaignTotalWei(input.campaignId),
      })
    }

    const existingByTransaction = await db.orm.public.CampaignPayment.first({
      transactionHash: input.transactionHash,
    })
    if (existingByTransaction) {
      if (!matchesPayment(existingByTransaction, input, user.id, donorWallet)) {
        return errorResponse("TRANSACTION_ALREADY_RECORDED", 409)
      }
      return NextResponse.json({
        ok: true,
        payment: serializePayment(existingByTransaction),
        idempotent: true,
        totalFundedWei: await getCampaignTotalWei(input.campaignId),
      })
    }

    const wallet = await db.orm.public.UserWallet.where({
      userId: user.id,
      address: donorWallet,
      chainType: "ethereum",
    }).first()
    if (!wallet) return errorResponse("WALLET_NOT_SYNCED", 409)

    const receipt = await readReceipt(input.transactionHash as Hex)
    if (!receipt) {
      return NextResponse.json(
        { ok: false, status: "PENDING", error: "TRANSACTION_NOT_MINED" },
        { status: 202 },
      )
    }
    if (receipt.status !== "success") return errorResponse("TRANSACTION_FAILED", 422)
    if (receipt.to?.toLowerCase() !== campaign.contractAddress.toLowerCase()) {
      return errorResponse("WRONG_CONTRACT", 422)
    }

    let event: ReturnType<typeof decodeFundsCommittedReceipt>
    try {
      event = decodeFundsCommittedReceipt(receipt, campaign.contractAddress as Address)
    } catch {
      return errorResponse("FUNDING_EVENT_NOT_FOUND", 422)
    }

    if (
      event.campaignId !== BigInt(campaign.contractCampaignId) ||
      event.funder.toLowerCase() !== donorWallet ||
      event.amount !== BigInt(input.amountWei) ||
      event.newFundedAmount > BigInt(campaign.targetAmountWei)
    ) {
      return errorResponse("FUNDING_EVENT_MISMATCH", 422)
    }

    let payment
    try {
      payment = await db.orm.public.CampaignPayment.create({
        campaignId: input.campaignId,
        donorId: user.id,
        donorWallet,
        amountWei: input.amountWei,
        mode: "ONCHAIN",
        status: "CONFIRMED",
        transactionHash: input.transactionHash,
        idempotencyKey: input.idempotencyKey,
        contractAddress: campaign.contractAddress,
        contractCampaignId: campaign.contractCampaignId,
        chainId: BSC_TESTNET_CHAIN_ID,
      })
    } catch (error) {
      const concurrentByKey = await db.orm.public.CampaignPayment.first({
        idempotencyKey: input.idempotencyKey,
      })
      if (concurrentByKey) {
        if (!matchesPayment(concurrentByKey, input, user.id, donorWallet)) {
          return errorResponse("IDEMPOTENCY_KEY_REUSED", 409)
        }
        payment = concurrentByKey
      } else {
        const concurrentByTransaction = await db.orm.public.CampaignPayment.first({
          transactionHash: input.transactionHash,
        })
        if (!concurrentByTransaction) throw error
        if (!matchesPayment(concurrentByTransaction, input, user.id, donorWallet)) {
          return errorResponse("TRANSACTION_ALREADY_RECORDED", 409)
        }
        payment = concurrentByTransaction
      }
    }
    return NextResponse.json({
      ok: true,
      payment: serializePayment(payment),
      totalFundedWei: await getCampaignTotalWei(input.campaignId),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("INVALID_PAYMENT", 422)
    }
    console.error("On-chain payment confirmation failed", error)
    return errorResponse("ONCHAIN_CONFIRM_FAILED", 500)
  }
}

async function readReceipt(transactionHash: Hex) {
  try {
    return await getPublicClient().getTransactionReceipt({ hash: transactionHash })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TransactionReceiptNotFoundError" ||
        /receipt.*not found|could not be found/i.test(error.message))
    ) {
      return null
    }
    throw error
  }
}

async function getCampaignTotalWei(campaignId: number) {
  const payments = await db.orm.public.CampaignPayment.where({ campaignId }).all()
  return payments
    .filter((payment) => payment.status === "CONFIRMED")
    .reduce((total, payment) => total + BigInt(payment.amountWei), BigInt(0))
    .toString()
}

function matchesPayment(
  payment: {
    campaignId: number
    donorId: number
    donorWallet: string
    amountWei: string
    mode: "MOCK" | "ONCHAIN"
    transactionHash: string | null
  },
  input: z.infer<typeof inputSchema>,
  donorId: number,
  donorWallet: string,
) {
  return (
    payment.campaignId === input.campaignId &&
    payment.donorId === donorId &&
    payment.donorWallet.toLowerCase() === donorWallet &&
    payment.amountWei === input.amountWei &&
    payment.mode === "ONCHAIN" &&
    payment.transactionHash === input.transactionHash
  )
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

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, error: code }, { status })
}
