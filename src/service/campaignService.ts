import { CreateDraftCampaignInput } from "../lib/type/campaignType"
import { db } from "../prisma/db"

export async function draftCampaignExistsByReference(
  aiReference: string
): Promise<boolean> {
  const existing = await db.orm.public.Campaign.where({ aiReference }).all()
  return existing.length > 0
}

export async function createDraftCampaign(input: CreateDraftCampaignInput) {
  return db.orm.public.Campaign.create({
    title: input.title,
    organizerName: "Admin Mizan",

    source: "AI_MOCK",
    communityId: null,
    aiDraft: input.aiDraftPayload,
    aiReference: input.aiReference,
    aiConfidence: input.aiConfidence,

    reviewStatus: "AI_DRAFT",

    targetAmountWei: input.targetAmountWei,
    raisedAmountWei: "0",
    currency: "BNB",

    category: input.category,
    recipientWallet: process.env.MIZAN_WALLET,
    summary: input.summary,
    location: input.location,
    daysLeft: input.days,
    fundingDeadline: new Date(Date.now() + Math.max(1, input.days) * 24 * 60 * 60 * 1000).toISOString(),
    image: input.image,
  })
}
