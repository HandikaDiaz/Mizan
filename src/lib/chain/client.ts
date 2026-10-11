import "server-only"

import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bscTestnet } from "viem/chains"

import {
  getChainConfig,
  getSignerPrivateKey,
  type ChainSignerRole,
} from "./config"

export function getPublicClient() {
  const config = getChainConfig()
  return createPublicClient({
    chain: bscTestnet,
    transport: http(config.rpcUrl),
  })
}

export function getWalletClient(role: ChainSignerRole) {
  const config = getChainConfig()
  const account = privateKeyToAccount(getSignerPrivateKey(role))
  return createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(config.rpcUrl),
  })
}
