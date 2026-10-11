import "server-only"

import { isAddress, type Address } from "viem"

import { db } from "@/src/prisma/db"
import { getPublicClient } from "@/src/lib/chain/client"
import {
  decodeFundsReleasedReceipt,
  getCampaignState,
  makeEvidenceHash,
  makeExternalRef,
  makeReleaseKey,
  registerCampaignOnChain,
  releaseFundsOnChain,
  submitMilestoneOnChain,
  verifyMilestoneOnChain,
  getMilestoneState,
  type ChainTransaction,
  ChainTransactionError,
} from "@/src/lib/chain/vault-service"
import { getChainConfig } from "@/src/lib/chain/config"

const MAX_ERROR_LENGTH = 1000

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.slice(0, MAX_ERROR_LENGTH)
}

function requirePositiveWei(value: string, label: string) {
  if (!/^\d+$/.test(value) || BigInt(value) <= BigInt(0)) {
    throw new Error(`${label} harus berupa wei positif.`)
  }
  return BigInt(value)
}

function requireCampaignDeadline(value: string | null) {
  if (!value) throw new Error("Funding deadline campaign belum dikonfigurasi.")
  const deadline = Math.floor(new Date(value).getTime() / 1000)
  if (!Number.isFinite(deadline) || deadline <= Math.floor(Date.now() / 1000)) {
    throw new Error("Funding deadline campaign sudah lewat atau tidak valid.")
  }
  return BigInt(deadline)
}

function requireRecipient(value: string | null): Address {
  if (!value || !isAddress(value)) {
    throw new Error("Wallet recipient campaign belum berupa address EVM yang valid.")
  }
  return value
}

function chainCampaignId(campaignId: number, value: string | null) {
  return requirePositiveWei(value || String(campaignId), "Contract campaign ID")
}

function chainMilestoneId(milestoneId: number, value: string | null) {
  return requirePositiveWei(value || String(milestoneId), "Contract milestone ID")
}

async function loadCampaignBundle(campaignId: number) {
  const campaign = await db.orm.public.Campaign.first({ id: campaignId })
  if (!campaign) throw new Error("Campaign tidak ditemukan.")
  const milestones = await db.orm.public.Milestone.where({ campaignId }).all()
  if (milestones.length === 0) throw new Error("Campaign harus memiliki minimal satu milestone.")
  return { campaign, milestones: [...milestones].sort((a, b) => a.order - b.order) }
}

function validateCampaignForChain(
  campaign: Awaited<ReturnType<typeof loadCampaignBundle>>["campaign"],
  milestones: Awaited<ReturnType<typeof loadCampaignBundle>>["milestones"],
) {
  if (campaign.currency !== "BNB") {
    throw new Error("Pencairan on-chain saat ini hanya mendukung campaign BNB.")
  }
  const targetAmount = requirePositiveWei(campaign.targetAmountWei, "Target campaign")
  const totalMilestones = milestones.reduce(
    (total, milestone) => total + requirePositiveWei(milestone.amountWei, "Nominal milestone"),
    BigInt(0),
  )
  if (totalMilestones !== targetAmount) {
    throw new Error("Total milestone harus sama persis dengan target campaign.")
  }
  return {
    targetAmount,
    fundingDeadline: requireCampaignDeadline(campaign.fundingDeadline),
    recipient: requireRecipient(campaign.recipientWallet),
  }
}

function isMatchingRegisteredCampaign(
  state: Awaited<ReturnType<typeof getCampaignState>>,
  targetAmount: bigint,
  fundingDeadline: bigint,
  recipient: Address,
) {
  return (
    state.exists &&
    state.targetAmount === targetAmount &&
    state.fundingDeadline === fundingDeadline &&
    state.recipient.toLowerCase() === recipient.toLowerCase()
  )
}

async function reconcileRegisteredCampaign(
  campaignId: number,
  tx: ChainTransaction | null,
) {
  const { contractAddress, chainId, contractVersion } = getChainConfig()
  await db.orm.public.Campaign.where({ id: campaignId }).update({
    contractCampaignId: String(campaignId),
    contractAddress,
    chainId,
    contractVersion,
    onchainStatus: "REGISTERED",
    onchainRegisteredAt: new Date().toISOString(),
    onchainRegistrationError: null,
    ...(tx
      ? { contractTransactionHash: tx.txHash }
      : {}),
  })
  const milestones = await db.orm.public.Milestone.where({ campaignId }).all()
  await Promise.all(
    milestones.map((milestone) =>
      db.orm.public.Milestone.where({ id: milestone.id }).update({
        contractMilestoneId: String(milestone.id),
      }),
    ),
  )
  return { contractAddress, chainId, contractVersion }
}

/** Register an approved campaign and its immutable milestone inventory on-chain. */
export async function registerCampaignForApproval(campaignId: number) {
  const { campaign, milestones } = await loadCampaignBundle(campaignId)
  const validation = validateCampaignForChain(campaign, milestones)
  const configuredContract = getChainConfig()

  if (
    campaign.onchainStatus === "REGISTERED" &&
    campaign.contractCampaignId === String(campaignId) &&
    campaign.contractAddress?.toLowerCase() === configuredContract.contractAddress.toLowerCase() &&
    campaign.chainId === configuredContract.chainId &&
    campaign.contractVersion === configuredContract.contractVersion
  ) {
    const registered = await getCampaignState(BigInt(campaignId)).catch(() => null)
    if (
      registered &&
      isMatchingRegisteredCampaign(
        registered,
        validation.targetAmount,
        validation.fundingDeadline,
        validation.recipient,
      )
    ) {
      return {
        txHash: campaign.contractTransactionHash,
        contractAddress: configuredContract.contractAddress,
        chainId: configuredContract.chainId,
        alreadyRegistered: true,
      }
    }
  }

  await db.orm.public.Campaign.where({ id: campaignId }).update({
    onchainStatus: "REGISTERING",
    onchainRegistrationError: null,
  })

  try {
    const existing = await getCampaignState(BigInt(campaignId)).catch(() => null)
    if (existing?.exists) {
      if (
        !isMatchingRegisteredCampaign(
          existing,
          validation.targetAmount,
          validation.fundingDeadline,
          validation.recipient,
        )
      ) {
        throw new Error("Campaign ID sudah terdaftar di contract dengan konfigurasi berbeda.")
      }
      const config = await reconcileRegisteredCampaign(campaignId, null)
      return { txHash: campaign.contractTransactionHash, ...config, alreadyRegistered: true }
    }

    const tx = await registerCampaignOnChain({
      campaignId: BigInt(campaignId),
      externalRef: makeExternalRef(campaignId),
      recipient: validation.recipient,
      targetAmount: validation.targetAmount,
      fundingDeadline: validation.fundingDeadline,
      milestones: milestones.map((milestone) => ({
        id: BigInt(milestone.id),
        amount: BigInt(milestone.amountWei),
      })),
    })
    const config = await reconcileRegisteredCampaign(campaignId, tx)
    return { txHash: tx.txHash, ...config, alreadyRegistered: false }
  } catch (error) {
    await db.orm.public.Campaign.where({ id: campaignId }).update({
      onchainStatus: "FAILED",
      onchainRegistrationError: errorMessage(error),
    })
    throw error
  }
}

async function loadRequestBundle(requestId: number) {
  const request = await db.orm.public.DisbursementRequest.first({ id: requestId })
  if (!request) throw new Error("Pengajuan pencairan tidak ditemukan.")
  const milestone = await db.orm.public.Milestone.first({ id: request.milestoneId })
  if (!milestone) throw new Error("Milestone pengajuan tidak ditemukan.")
  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  if (!campaign) throw new Error("Campaign pengajuan tidak ditemukan.")
  return { request, milestone, campaign }
}

/** Prepare the milestone on-chain, then move the request to ADMIN_APPROVED. */
export async function approveDisbursementRequestOnChain(requestId: number) {
  let bundle = await loadRequestBundle(requestId)
  if (bundle.request.status === "ADMIN_APPROVED") return bundle.request
  if (bundle.request.status !== "AI_VERIFIED" && bundle.request.status !== "MANUAL_REVIEW") {
    throw new Error("Pengajuan belum berada pada status yang dapat disetujui admin.")
  }
  if (bundle.campaign.reviewStatus !== "APPROVED" || bundle.campaign.status !== "ACTIVE") {
    throw new Error("Campaign harus aktif dan sudah disetujui sebelum pencairan.")
  }

  if (bundle.campaign.onchainStatus !== "REGISTERED") {
    await registerCampaignForApproval(bundle.campaign.id)
    bundle = await loadRequestBundle(requestId)
  }

  const campaignId = chainCampaignId(bundle.campaign.id, bundle.campaign.contractCampaignId)
  const milestoneId = chainMilestoneId(bundle.milestone.id, bundle.milestone.contractMilestoneId)
  const evidenceHash = (bundle.milestone.evidenceHash || makeEvidenceHash({
    proofReference: bundle.milestone.proofImageUrl || "",
    proofNote: bundle.milestone.proofNote,
    requestId,
  })) as `0x${string}`

  if (!bundle.milestone.evidenceHash) {
    await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ evidenceHash })
  }

  try {
    let chainMilestone = await getMilestoneState(campaignId, milestoneId)
    let evidenceTransactionHash: string | null = null
    if (chainMilestone.evidenceHash.toLowerCase() !== evidenceHash.toLowerCase()) {
      const submitted = await submitMilestoneOnChain({ campaignId, milestoneId, evidenceHash })
      evidenceTransactionHash = submitted.txHash
      chainMilestone = await getMilestoneState(campaignId, milestoneId)
    }

    let verificationTransactionHash = bundle.request.verificationTransactionHash
    if (!chainMilestone.verified) {
      const verified = await verifyMilestoneOnChain({
        campaignId,
        milestoneId,
        expectedAmount: BigInt(bundle.milestone.amountWei),
      })
      verificationTransactionHash = verified.txHash
    }

    const updated = await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
      status: "ADMIN_APPROVED",
      approvedAmountWei: bundle.milestone.amountWei,
      verificationTransactionHash: verificationTransactionHash || evidenceTransactionHash,
      chainError: null,
    })
    await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ status: "ADMIN_APPROVED" })
    return updated
  } catch (error) {
    await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
      chainError: errorMessage(error),
    })
    throw error
  }
}

/** Release the exact milestone amount with the request's stable idempotency key. */
export async function executeDisbursementOnChain(requestId: number) {
  const bundle = await loadRequestBundle(requestId)
  if (bundle.request.status === "DISBURSED") return bundle.request
  if (bundle.request.status !== "ADMIN_APPROVED" && bundle.request.status !== "CHAIN_FAILED") {
    throw new Error("Pengajuan belum disetujui admin untuk pencairan on-chain.")
  }
  if (bundle.campaign.onchainStatus !== "REGISTERED") {
    throw new Error("Campaign belum terdaftar di smart contract.")
  }

  const idempotencyKey = bundle.request.idempotencyKey || `disbursement:${requestId}`
  if (!bundle.request.idempotencyKey) {
    await db.orm.public.DisbursementRequest.where({ id: requestId }).update({ idempotencyKey })
  }

  await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
    status: "CHAIN_PENDING",
    chainError: null,
  })
  await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ status: "CHAIN_PENDING" })

  try {
    const tx = await releaseFundsOnChain({
      campaignId: chainCampaignId(bundle.campaign.id, bundle.campaign.contractCampaignId),
      milestoneId: chainMilestoneId(bundle.milestone.id, bundle.milestone.contractMilestoneId),
      releaseKey: makeReleaseKey(idempotencyKey),
      expectedRecipient: requireRecipient(bundle.campaign.recipientWallet),
      expectedAmount: BigInt(bundle.milestone.amountWei),
    })
    const updated = await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
      status: "DISBURSED",
      activeRequestKey: null,
      transactionHash: tx.txHash,
      blockNumber: tx.blockNumber,
      logIndex: tx.logIndex,
      chainError: null,
    })
    await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({
      status: "DISBURSED",
      disbursementTxHash: tx.txHash,
    })
    return updated
  } catch (error) {
    const needsReconciliation =
      error instanceof ChainTransactionError && error.receiptStatus !== "reverted"
    if (needsReconciliation) {
      const pending = await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
        status: "CHAIN_PENDING",
        transactionHash: error.txHash,
        chainError: errorMessage(error),
      })
      await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ status: "CHAIN_PENDING" })
      return pending
    } else {
      await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
        status: "CHAIN_FAILED",
        transactionHash: error instanceof ChainTransactionError
          ? error.txHash
          : bundle.request.transactionHash,
        retryCount: bundle.request.retryCount + 1,
        chainError: errorMessage(error),
      })
      await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ status: "CHAIN_FAILED" })
    }
    throw error
  }
}

export async function retryDisbursementOnChain(requestId: number) {
  const request = await db.orm.public.DisbursementRequest.first({ id: requestId })
  if (!request || request.status !== "CHAIN_FAILED") {
    throw new Error("Hanya pencairan dengan status CHAIN_FAILED yang dapat dicoba ulang.")
  }
  return executeDisbursementOnChain(requestId)
}

export async function reconcileDisbursementOnChain(requestId: number) {
  const bundle = await loadRequestBundle(requestId)
  if (bundle.request.status !== "CHAIN_PENDING") {
    throw new Error("Hanya pencairan CHAIN_PENDING yang dapat direkonsiliasi.")
  }
  if (!bundle.request.transactionHash) {
    throw new Error("Hash transaksi belum tersedia untuk rekonsiliasi.")
  }

  const receipt = await getPublicClient().getTransactionReceipt({
    hash: bundle.request.transactionHash as `0x${string}`,
  }).catch(() => null)
  if (!receipt) return bundle.request
  if (receipt.status !== "success") {
    await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
      status: "CHAIN_FAILED",
      chainError: "Transaksi on-chain gagal.",
      retryCount: bundle.request.retryCount + 1,
    })
    await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({ status: "CHAIN_FAILED" })
    throw new Error("Transaksi on-chain gagal.")
  }

  const config = getChainConfig()
  const event = decodeFundsReleasedReceipt(receipt, config.contractAddress)
  const expectedCampaignId = chainCampaignId(bundle.campaign.id, bundle.campaign.contractCampaignId)
  const expectedMilestoneId = chainMilestoneId(bundle.milestone.id, bundle.milestone.contractMilestoneId)
  const expectedRecipient = requireRecipient(bundle.campaign.recipientWallet)
  const expectedAmount = BigInt(bundle.milestone.amountWei)
  const expectedReleaseKey = makeReleaseKey(
    bundle.request.idempotencyKey || `disbursement:${requestId}`,
  )
  if (
    event.campaignId !== expectedCampaignId ||
    event.milestoneId !== expectedMilestoneId ||
    event.recipient.toLowerCase() !== expectedRecipient.toLowerCase() ||
    event.amount !== expectedAmount ||
    event.releaseKey.toLowerCase() !== expectedReleaseKey.toLowerCase()
  ) {
    throw new Error("FundsReleased tidak sesuai dengan request pencairan.")
  }

  const updated = await db.orm.public.DisbursementRequest.where({ id: requestId }).update({
    status: "DISBURSED",
    activeRequestKey: null,
    blockNumber: receipt.blockNumber,
    logIndex: event.logIndex,
    chainError: null,
  })
  await db.orm.public.Milestone.where({ id: bundle.milestone.id }).update({
    status: "DISBURSED",
    disbursementTxHash: bundle.request.transactionHash,
  })
  return updated
}
