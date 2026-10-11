export function selectNewestCampaigns<T extends { createdAt: string }>(
  campaigns: T[],
): T[] {
  return [...campaigns]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 3)
}
