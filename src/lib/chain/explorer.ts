import { BSC_TESTNET_EXPLORER_URL } from "./constants"

export function getExplorerUrl(txHash: string): string {
  return `${BSC_TESTNET_EXPLORER_URL}/tx/${txHash}`
}

export function getContractUrl(address: string): string {
  return `${BSC_TESTNET_EXPLORER_URL}/address/${address}`
}
