import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { loadEnvFile } from "node:process"
import { fileURLToPath } from "node:url"
import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  keccak256,
  parseEther,
  stringToHex,
  type Abi,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bscTestnet } from "viem/chains"

type VaultArtifact = { abi: Abi }

const envFile = fileURLToPath(new URL("../.env", import.meta.url))
if (existsSync(envFile)) loadEnvFile(envFile)

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value?.trim()) throw new Error(`Env ${name} wajib diisi di .env`)
  return value.trim()
}

function normalizeKey(raw: string, name: string): Hex {
  const key = raw.startsWith("0x") ? raw : `0x${raw}`
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) throw new Error(`Env ${name} bukan private key valid`)
  return key as Hex
}

const rpcUrl = requireEnv("BSC_TESTNET_RPC_URL")
const managerKey = normalizeKey(requireEnv("CAMPAIGN_MANAGER_PRIVATE_KEY"), "CAMPAIGN_MANAGER_PRIVATE_KEY")
const verifierKey = normalizeKey(requireEnv("VERIFIER_PRIVATE_KEY"), "VERIFIER_PRIVATE_KEY")
const disburserKey = normalizeKey(requireEnv("DISBURSER_PRIVATE_KEY"), "DISBURSER_PRIVATE_KEY")
const funderEnvName = process.env.FUNDER_PRIVATE_KEY?.trim()
  ? "FUNDER_PRIVATE_KEY"
  : "DEPLOYER_PRIVATE_KEY"
const funderKey = normalizeKey(requireEnv(funderEnvName), funderEnvName)

const deployedPath = fileURLToPath(
  new URL("../ignition/deployments/chain-97/deployed_addresses.json", import.meta.url),
)
const deployed = existsSync(deployedPath)
  ? JSON.parse(readFileSync(deployedPath, "utf8")) as Record<string, string>
  : {}
const vaultAddress = (process.env.VAULT_ADDRESS?.trim() ||
  deployed["MizanFundingVaultModule#MizanFundingVault"]) as Address
if (!vaultAddress) throw new Error("VAULT_ADDRESS atau hasil deployment chain-97 tidak ditemukan")

const artifactPath = fileURLToPath(
  new URL("../artifacts/src/MizanFundingVault.sol/MizanFundingVault.json", import.meta.url),
)
const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as VaultArtifact
const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) })

const manager = privateKeyToAccount(managerKey)
const verifier = privateKeyToAccount(verifierKey)
const disburser = privateKeyToAccount(disburserKey)
const funder = privateKeyToAccount(funderKey)
const campaignId = BigInt(Date.now())
const milestoneId = campaignId * BigInt(10) + BigInt(1)
const targetAmount = parseEther(process.env.SMOKE_TARGET_BNB?.trim() || "0.001")
const externalRef = keccak256(stringToHex(`mizan-smoke:${campaignId}`))
const releaseKey = keccak256(stringToHex(`mizan-smoke-release:${campaignId}`))
const evidenceHash = keccak256(stringToHex(`mizan-smoke-evidence:${campaignId}`))
const latestBlock = await publicClient.getBlock()
const fundingDeadline = latestBlock.timestamp + BigInt(3600)

async function write(
  label: string,
  key: Hex,
  functionName: string,
  args: readonly unknown[],
  value?: bigint,
) {
  const account = privateKeyToAccount(key)
  const wallet = createWalletClient({ account, chain: bscTestnet, transport: http(rpcUrl) })
  console.log(`→ ${label} ...`)
  const hash = await wallet.writeContract({
    address: vaultAddress,
    abi: artifact.abi,
    functionName,
    args,
    value,
    chain: bscTestnet,
    account,
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== "success") throw new Error(`${label} gagal: ${hash}`)
  console.log(`  OK  ${hash}`)
  return receipt
}

function eventArgs(receipt: TransactionReceipt, eventName: string) {
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== vaultAddress.toLowerCase()) continue
    try {
      const decoded = decodeEventLog({
        abi: artifact.abi,
        eventName,
        topics: log.topics,
        data: log.data,
      })
      return decoded.args as unknown as Record<string, unknown>
    } catch {
      continue
    }
  }
  throw new Error(`Event ${eventName} tidak ditemukan`)
}

async function assertRole(roleFunction: string, account: Address) {
  const role = await publicClient.readContract({
    address: vaultAddress,
    abi: artifact.abi,
    functionName: roleFunction,
  }) as Hex
  const hasRole = await publicClient.readContract({
    address: vaultAddress,
    abi: artifact.abi,
    functionName: "hasRole",
    args: [role, account],
  })
  assert.equal(hasRole, true, `${account} tidak memiliki ${roleFunction}`)
}

assert.equal(await publicClient.getChainId(), 97, "RPC bukan BSC Testnet")
await assertRole("CAMPAIGN_MANAGER_ROLE", manager.address)
await assertRole("VERIFIER_ROLE", verifier.address)
await assertRole("DISBURSER_ROLE", disburser.address)

console.log("Vault:", vaultAddress)
console.log("CampaignId:", campaignId.toString())

const registered = await write("registerCampaign", managerKey, "registerCampaign", [
  campaignId,
  externalRef,
  funder.address,
  targetAmount,
  fundingDeadline,
  [{ id: milestoneId, amount: targetAmount }],
])
const registeredEvent = eventArgs(registered, "CampaignRegistered")
assert.equal(registeredEvent.campaignId, campaignId)
assert.equal(registeredEvent.externalRef, externalRef)
assert.equal((registeredEvent.recipient as Address).toLowerCase(), funder.address.toLowerCase())
assert.equal(registeredEvent.targetAmount, targetAmount)
assert.equal(registeredEvent.fundingDeadline, fundingDeadline)
assert.equal(registeredEvent.milestoneCount, BigInt(1))

const funded = await write("fundCampaign", funderKey, "fundCampaign", [campaignId], targetAmount)
const fundedEvent = eventArgs(funded, "FundsCommitted")
assert.equal(fundedEvent.campaignId, campaignId)
assert.equal((fundedEvent.funder as Address).toLowerCase(), funder.address.toLowerCase())
assert.equal(fundedEvent.amount, targetAmount)
assert.equal(fundedEvent.newFundedAmount, targetAmount)

const submitted = await write("submitMilestone", managerKey, "submitMilestone", [
  campaignId,
  milestoneId,
  evidenceHash,
])
assert.equal(eventArgs(submitted, "MilestoneSubmitted").evidenceHash, evidenceHash)

const verified = await write("verifyMilestone", verifierKey, "verifyMilestone", [
  campaignId,
  milestoneId,
])
assert.equal(eventArgs(verified, "MilestoneVerified").amount, targetAmount)

const released = await write("releaseFunds", disburserKey, "releaseFunds", [
  campaignId,
  milestoneId,
  releaseKey,
])
const releasedEvent = eventArgs(released, "FundsReleased")
assert.equal(releasedEvent.campaignId, campaignId)
assert.equal(releasedEvent.milestoneId, milestoneId)
assert.equal((releasedEvent.recipient as Address).toLowerCase(), funder.address.toLowerCase())
assert.equal(releasedEvent.amount, targetAmount)
assert.equal(releasedEvent.releaseKey, releaseKey)

const summary = await publicClient.readContract({
  address: vaultAddress,
  abi: artifact.abi,
  functionName: "getCampaignSummary",
  args: [campaignId],
}) as readonly [bigint, bigint, bigint, bigint]
assert.deepEqual(summary, [targetAmount, BigInt(0), targetAmount, BigInt(0)])

console.log("Smoke testnet SELESAI: register → fund → submit → verify → release terverifikasi.")
console.log(`Lihat kontrak: https://testnet.bscscan.com/address/${vaultAddress}`)
