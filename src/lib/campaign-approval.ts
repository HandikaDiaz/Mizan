import type { CampaignFormState } from "./campaign-workflow"

export function getCampaignApprovalResult(
  registrationError?: unknown,
): CampaignFormState {
  if (registrationError) {
    return {
      success: true,
      message:
        "Campaign disetujui, tetapi belum terdaftar ke smart contract. Periksa konfigurasi chain.",
    }
  }

  return {
    success: true,
    message: "Campaign disetujui dan siap dipublish.",
  }
}
