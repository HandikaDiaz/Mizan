import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("MizanFundingVaultModule", (m) => {
  const deployer = m.getAccount(0)
  const vault = m.contract("MizanFundingVault", [deployer])

  const campaignManager = m.getParameter("campaignManager")
  const pauser = m.getParameter("pauser")
  const verifier = m.getParameter("verifier")
  const disburser = m.getParameter("disburser")

  const managerRole = m.staticCall(vault, "CAMPAIGN_MANAGER_ROLE")
  const pauserRole = m.staticCall(vault, "PAUSER_ROLE")
  const verifierRole = m.staticCall(vault, "VERIFIER_ROLE")
  const disburserRole = m.staticCall(vault, "DISBURSER_ROLE")

  m.call(vault, "grantRole", [managerRole, campaignManager], {
    id: "grantCampaignManagerRole",
  })
  m.call(vault, "grantRole", [pauserRole, pauser], {
    id: "grantPauserRole",
  })
  m.call(vault, "grantRole", [verifierRole, verifier], {
    id: "grantVerifierRole",
  })
  m.call(vault, "grantRole", [disburserRole, disburser], {
    id: "grantDisburserRole",
  })

  return { vault }
})
