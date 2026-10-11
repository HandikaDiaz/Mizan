export type AdminCampaignSource = "ALL" | "AI_MOCK" | "MANUAL"

export type AdminCampaignFilterInput = {
  source: AdminCampaignSource
  query: string
}

type CampaignFilterRow = {
  title: string
  organizerName: string
  source?: "AI_MOCK" | "MANUAL"
  aiReference?: string | null
}

export function filterAdminCampaigns<T extends CampaignFilterRow>(
  campaigns: T[],
  filter: AdminCampaignFilterInput
): T[] {
  const query = filter.query.trim().toLocaleLowerCase()

  return campaigns.filter((campaign) => {
    const matchesSource =
      filter.source === "ALL" || campaign.source === filter.source
    if (!matchesSource) return false
    if (!query) return true

    return [campaign.title, campaign.organizerName, campaign.aiReference ?? ""]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query)
  })
}
