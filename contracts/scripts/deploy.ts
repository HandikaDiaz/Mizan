import { readFile } from "node:fs/promises"
import hre from "hardhat"
import VaultModule from "../ignition/modules/MizanFundingVault.js"
import { validateDeploymentParameters } from "./deployment-parameters.js"

// Validate all role addresses before connecting or sending any transaction.
const parameterFile = new URL("../ignition/params.bscTestnet.json", import.meta.url)
const parameters = validateDeploymentParameters(JSON.parse(await readFile(parameterFile, "utf8")))
const connection = await hre.network.create({ network: "bscTestnet" })
try {
  const client = await connection.viem.getPublicClient()
  if (await client.getChainId() !== 97) throw new Error("RPC bukan BSC Testnet (97)")
  const { vault } = await connection.ignition.deploy(VaultModule, { parameters })
  const expected = parameters.MizanFundingVaultModule
  const grants = [
    [await vault.read.CAMPAIGN_MANAGER_ROLE(), expected.campaignManager],
    [await vault.read.PAUSER_ROLE(), expected.pauser],
    [await vault.read.VERIFIER_ROLE(), expected.verifier],
    [await vault.read.DISBURSER_ROLE(), expected.disburser],
  ] as const
  for (const [role, recipient] of grants) {
    if (!await vault.read.hasRole([role, recipient as `0x${string}`])) throw new Error("Verifikasi role setelah deploy gagal")
  }
  console.log(`MizanFundingVault: ${vault.address}; seluruh role parameter terverifikasi`)
} finally {
  await connection.close()
}
