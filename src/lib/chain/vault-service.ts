import "server-only"

import {
  decodeEventLog,
  keccak256,
  stringToHex,
  type Abi,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem"

import abiJson from "./abi/MizanFundingVault.v4.json"
import { getPublicClient, getWalletClient } from "./client"
import { getChainConfig, type ChainSignerRole } from "./config"

const abi = abiJson as Abi

export type ChainTransaction = {
  txHash: Hex
  blockNumber: bigint
  logIndex: number
}

export type ChainReceiptStatus = "unknown" | "reverted" | "success"

export class ChainTransactionError extends Error {
  constructor(
    message: string,
    public readonly txHash: Hex,
    public readonly receiptStatus: ChainReceiptStatus,
  ) {
    super(message)
    this.name = "ChainTransactionError"
  }
}

export type ChainCampaignState = {
  exists: boolean
  recipient: Address
  targetAmount: bigint
  fundedAmount: bigint
  reservedAmount: bigint
  releasedAmount: bigint
  availableAmount: bigint
  contributionCount: bigint
  fundingDeadline: bigint
  active: boolean
  cancelled: boolean
}

export type ChainMilestoneState = {
  id: bigint
  campaignId: bigint
  amount: bigint
  evidenceHash: Hex
  verified: boolean
  released: boolean
  exists: boolean
}

export type RegisterCampaignParams = {
  campaignId: bigint
  externalRef: Hex
  recipient: Address
  targetAmount: bigint
  fundingDeadline: bigint
  milestones: { id: bigint; amount: bigint }[]
}

export type ReleaseFundsParams = {
  campaignId: bigint
  milestoneId: bigint
  releaseKey: Hex
  expectedRecipient?: Address
  expectedAmount?: bigint
}

export function makeExternalRef(campaignId: number): Hex {
  return keccak256(stringToHex(`mizan:campaign:${campaignId}`))
}

export function makeEvidenceHash(input: {
  proofReference: string
  proofNote: string | null
  requestId?: number
}): Hex {
  return keccak256(
    stringToHex(
      JSON.stringify({
        proofReference: input.proofReference,
        proofNote: input.proofNote ?? "",
        requestId: input.requestId ?? null,
      }),
    ),
  )
}

export function makeReleaseKey(idempotencyKey: string): Hex {
  return keccak256(stringToHex(`mizan:release:${idempotencyKey}`))
}

async function waitForReceipt(txHash: Hex): Promise<TransactionReceipt> {
  let receipt: TransactionReceipt
  try {
    receipt = await getPublicClient().waitForTransactionReceipt({ hash: txHash })
  } catch (error) {
    throw new ChainTransactionError(
      error instanceof Error ? error.message : "Receipt transaksi belum dapat dibaca.",
      txHash,
      "unknown",
    )
  }
  if (receipt.status !== "success") {
    throw new ChainTransactionError(`Transaksi chain gagal: ${txHash}`, txHash, "reverted")
  }
  return receipt
}

function eventFromReceipt(
  receipt: TransactionReceipt,
  eventName: string,
  address: Address,
) {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== address.toLowerCase()) continue
    try {
      const decoded = decodeEventLog({
        abi,
        eventName,
        topics: log.topics,
        data: log.data,
      })
      return { decoded, logIndex: Number(log.logIndex ?? 0) }
    } catch {
      continue
    }
  }
  throw new Error(`Event ${eventName} tidak ditemukan pada receipt ${receipt.transactionHash}.`)
}

async function writeAndValidate(
  role: ChainSignerRole,
  functionName: string,
  args: readonly unknown[],
) {
  const config = getChainConfig()
  const wallet = getWalletClient(role)
  const txHash = await wallet.writeContract({
    address: config.contractAddress,
    abi,
    functionName,
    args,
    chain: wallet.chain,
    account: wallet.account,
  })
  const receipt = await waitForReceipt(txHash)
  return { config, receipt, txHash }
}

export async function registerCampaignOnChain(
  params: RegisterCampaignParams,
): Promise<ChainTransaction> {
  const { config, receipt, txHash } = await writeAndValidate(
    "campaignManager",
    "registerCampaign",
    [
      params.campaignId,
      params.externalRef,
      params.recipient,
      params.targetAmount,
      params.fundingDeadline,
      params.milestones,
    ],
  )
  const { decoded, logIndex } = eventFromReceipt(
    receipt,
    "CampaignRegistered",
    config.contractAddress,
  )
  const args = decoded.args as unknown as {
    campaignId: bigint
    externalRef: Hex
    recipient: Address
    targetAmount: bigint
    fundingDeadline: bigint
    milestoneCount: bigint
  }
  if (
    args.campaignId !== params.campaignId ||
    args.externalRef.toLowerCase() !== params.externalRef.toLowerCase() ||
    args.recipient.toLowerCase() !== params.recipient.toLowerCase() ||
    args.targetAmount !== params.targetAmount ||
    args.fundingDeadline !== params.fundingDeadline ||
    args.milestoneCount !== BigInt(params.milestones.length)
  ) {
    throw new Error("CampaignRegistered tidak sesuai dengan payload registrasi.")
  }
  return { txHash, blockNumber: receipt.blockNumber, logIndex }
}

export async function submitMilestoneOnChain(params: {
  campaignId: bigint
  milestoneId: bigint
  evidenceHash: Hex
}): Promise<ChainTransaction> {
  const { config, receipt, txHash } = await writeAndValidate("campaignManager", "submitMilestone", [
    params.campaignId,
    params.milestoneId,
    params.evidenceHash,
  ])
  const { decoded, logIndex } = eventFromReceipt(receipt, "MilestoneSubmitted", config.contractAddress)
  const args = decoded.args as unknown as { campaignId: bigint; milestoneId: bigint; evidenceHash: Hex }
  if (
    args.campaignId !== params.campaignId ||
    args.milestoneId !== params.milestoneId ||
    args.evidenceHash.toLowerCase() !== params.evidenceHash.toLowerCase()
  ) {
    throw new Error("MilestoneSubmitted tidak sesuai dengan payload evidence.")
  }
  return { txHash, blockNumber: receipt.blockNumber, logIndex }
}

export async function verifyMilestoneOnChain(params: {
  campaignId: bigint
  milestoneId: bigint
  expectedAmount?: bigint
}): Promise<ChainTransaction> {
  const { config, receipt, txHash } = await writeAndValidate("verifier", "verifyMilestone", [
    params.campaignId,
    params.milestoneId,
  ])
  const { decoded, logIndex } = eventFromReceipt(receipt, "MilestoneVerified", config.contractAddress)
  const args = decoded.args as unknown as { campaignId: bigint; milestoneId: bigint; amount: bigint }
  if (
    args.campaignId !== params.campaignId ||
    args.milestoneId !== params.milestoneId ||
    (params.expectedAmount !== undefined && args.amount !== params.expectedAmount)
  ) {
    throw new Error("MilestoneVerified tidak sesuai dengan milestone database.")
  }
  return { txHash, blockNumber: receipt.blockNumber, logIndex }
}

export async function releaseFundsOnChain(
  params: ReleaseFundsParams,
): Promise<ChainTransaction> {
  const { config, receipt, txHash } = await writeAndValidate("disburser", "releaseFunds", [
    params.campaignId,
    params.milestoneId,
    params.releaseKey,
  ])
  try {
    const { decoded, logIndex } = eventFromReceipt(receipt, "FundsReleased", config.contractAddress)
    const args = decoded.args as unknown as {
      campaignId: bigint
      milestoneId: bigint
      recipient: Address
      amount: bigint
      releaseKey: Hex
    }
    if (
      args.campaignId !== params.campaignId ||
      args.milestoneId !== params.milestoneId ||
      (params.expectedRecipient && args.recipient.toLowerCase() !== params.expectedRecipient.toLowerCase()) ||
      (params.expectedAmount !== undefined && args.amount !== params.expectedAmount) ||
      args.releaseKey.toLowerCase() !== params.releaseKey.toLowerCase()
    ) {
      throw new Error("FundsReleased tidak sesuai dengan request pencairan.")
    }
    return { txHash, blockNumber: receipt.blockNumber, logIndex }
  } catch (error) {
    throw new ChainTransactionError(
      error instanceof Error ? error.message : "Event release tidak dapat divalidasi.",
      txHash,
      "success",
    )
  }
}

export async function getCampaignState(campaignId: bigint): Promise<ChainCampaignState> {
  const { contractAddress } = getChainConfig()
  const campaign = (await getPublicClient().readContract({
    address: contractAddress,
    abi,
    functionName: "getCampaign",
    args: [campaignId],
  })) as unknown as {
    recipient: Address
    targetAmount: bigint
    fundedAmount: bigint
    reservedAmount: bigint
    releasedAmount: bigint
    contributionCount: bigint
    fundingDeadline: bigint
    active: boolean
    cancelled: boolean
    exists: boolean
  }
  return {
    exists: campaign.exists,
    recipient: campaign.recipient,
    targetAmount: campaign.targetAmount,
    fundedAmount: campaign.fundedAmount,
    reservedAmount: campaign.reservedAmount,
    releasedAmount: campaign.releasedAmount,
    availableAmount: campaign.fundedAmount - campaign.releasedAmount - campaign.reservedAmount,
    contributionCount: campaign.contributionCount,
    fundingDeadline: campaign.fundingDeadline,
    active: campaign.active,
    cancelled: campaign.cancelled,
  }
}

export async function getMilestoneState(
  campaignId: bigint,
  milestoneId: bigint,
): Promise<ChainMilestoneState> {
  const { contractAddress } = getChainConfig()
  return (await getPublicClient().readContract({
    address: contractAddress,
    abi,
    functionName: "getMilestone",
    args: [campaignId, milestoneId],
  })) as unknown as ChainMilestoneState
}

export async function getCampaignSummary(campaignId: bigint) {
  const { contractAddress } = getChainConfig()
  return (await getPublicClient().readContract({
    address: contractAddress,
    abi,
    functionName: "getCampaignSummary",
    args: [campaignId],
  })) as readonly [bigint, bigint, bigint, bigint]
}

export function getVaultAbi() {
  return abi
}

export function decodeFundsCommittedReceipt(
  receipt: TransactionReceipt,
  contractAddress: Address,
) {
  const { decoded, logIndex } = eventFromReceipt(receipt, "FundsCommitted", contractAddress)
  const args = decoded.args as unknown as {
    campaignId: bigint
    funder: Address
    amount: bigint
    newFundedAmount: bigint
  }
  return { ...args, logIndex }
}

export function decodeFundsReleasedReceipt(
  receipt: TransactionReceipt,
  contractAddress: Address,
) {
  const { decoded, logIndex } = eventFromReceipt(receipt, "FundsReleased", contractAddress)
  const args = decoded.args as unknown as {
    campaignId: bigint
    milestoneId: bigint
    recipient: Address
    amount: bigint
    releaseKey: Hex
  }
  return { ...args, logIndex }
}
