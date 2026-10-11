
export function groupAnalysesByEvent(analyses: any[]): any[][] {
  const groups = new Map<string, any[]>()

  for (const a of analyses) {
    if (!a.isDisaster) continue
    if (a.validationStatus === "REJECTED") continue

    const key = `${a.disasterType}::${a.province}::${a.locationName}`

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(a)
  }

  return Array.from(groups.values())
}
