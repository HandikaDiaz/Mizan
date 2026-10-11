import "server-only"

import { isAddress, type Address, type Hex } from "viem"

import { BSC_TESTNET_CHAIN_ID } from "./constants"
const DEFAULT_RPC_URL = "https://data-seed-prebsc-1-s1.bnbchain.org:8545"

export type ChainSignerRole = "campaignManager" | "verifier" | "disburser"

export type ChainConfig = {
  chainId: typeof BSC_TESTNET_CHAIN_ID
  rpcUrl: string
  contractAddress: Address
  contractVersion: string
}

export function getChainConfig(): ChainConfig {
  const contractAddress = process.env.MIZAN_CONTRACT_ADDRESS?.trim()
  if (!contractAddress || !isAddress(contractAddress)) {
    throw new Error("MIZAN_CONTRACT_ADDRESS belum dikonfigurasi dengan address valid.")
  }

  return {
    chainId: BSC_TESTNET_CHAIN_ID,
    rpcUrl: process.env.BSC_TESTNET_RPC_URL?.trim() || DEFAULT_RPC_URL,
    contractAddress,
    contractVersion: process.env.MIZAN_CONTRACT_VERSION?.trim() || "v4",
  }
}

export function getSignerPrivateKey(role: ChainSignerRole): Hex {
  const envByRole: Record<ChainSignerRole, string[]> = {
    campaignManager: [
      "MIZAN_CAMPAIGN_MANAGER_PRIVATE_KEY",
      "MIZAN_MANAGER_PRIVATE_KEY",
      "CAMPAIGN_MANAGER_PRIVATE_KEY",
    ],
    verifier: ["MIZAN_VERIFIER_PRIVATE_KEY"],
    disburser: ["MIZAN_DISBURSER_PRIVATE_KEY"],
  }
  const envName = envByRole[role].find((name) => process.env[name]?.trim())
  const value = envName ? process.env[envName]?.trim() : null
  if (!value) {
    throw new Error(`Private key signer ${role} belum dikonfigurasi.`)
  }
  const normalized = value.startsWith("0x") ? value : `0x${value}`
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error(`Private key signer ${role} tidak valid.`)
  }
  return normalized as Hex
}
