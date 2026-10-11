export type MilestoneVerificationPayloadInput = {
  file: File
  proofImageUrl: string
  proofNote: string
  milestoneDescription: string
  campaignTitle: string
}

export type MilestoneVerificationPayload = {
  input_value: string
  input_type: "chat"
  output_type: "chat"
  files: string[]
}

export type MilestonePdfRunPayload = {
  input_value: string
  input_type: "chat"
  output_type: "chat"
  tweaks: Record<string, { path: string[] }>
}

type MilestoneVerificationMetadata = {
  proofImageUrl: string
  proofNote: string
  milestoneDescription: string
  campaignTitle: string
}

const buildVerificationInputValue = (input: MilestoneVerificationMetadata) =>
  JSON.stringify({
    proof_image_url: input.proofImageUrl,
    proof_note: input.proofNote,
    milestone_description: input.milestoneDescription,
    campaign_title: input.campaignTitle,
  })

export async function buildMilestoneVerificationPayload(
  input: MilestoneVerificationPayloadInput,
): Promise<MilestoneVerificationPayload> {
  const fileBase64 = Buffer.from(await input.file.arrayBuffer()).toString("base64")

  return {
    input_value: buildVerificationInputValue(input),
    input_type: "chat",
    output_type: "chat",
    files: [`data:${input.file.type};base64,${fileBase64}`],
  }
}

export const buildMilestonePdfRunPayload = (input: {
  filePath: string
  componentId: string
} & MilestoneVerificationMetadata): MilestonePdfRunPayload => ({
  input_value: buildVerificationInputValue(input),
  input_type: "chat",
  output_type: "chat",
  tweaks: {
    [input.componentId]: {
      path: [input.filePath],
    },
  },
})
