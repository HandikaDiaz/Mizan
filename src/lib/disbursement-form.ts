import { decimalBnbToWei } from "./payments/validation"

export type DisbursementItemDraft = {
  name: string
  quantity: string
  unit: string
  unitPrice: string
}

export type DisbursementItemPayload = {
  name: string
  quantity: number
  unit: string
  unitPriceWei: string
}

export type DisbursementFormPayload = {
  milestoneId: number
  requestedAmountWei: string
  description: string
  region: string
  items: DisbursementItemPayload[]
}

export function buildDisbursementItems(
  drafts: DisbursementItemDraft[],
): DisbursementItemPayload[] {
  if (drafts.length === 0) {
    throw new Error("Tambahkan setidaknya satu item penggunaan dana.")
  }

  return drafts.map((draft) => {
    const quantity = Number(draft.quantity)
    const unitPriceWei = decimalBnbToWei(draft.unitPrice)
    if (
      !draft.name.trim() ||
      !draft.unit.trim() ||
      !unitPriceWei ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error("Lengkapi semua rincian item dengan format yang valid.")
    }

    return {
      name: draft.name.trim(),
      quantity,
      unit: draft.unit.trim(),
      unitPriceWei,
    }
  })
}

export function calculateDisbursementTotalWei(
  items: DisbursementItemPayload[],
): string {
  return items
    .reduce(
      (total, item) =>
        total + BigInt(item.unitPriceWei) * BigInt(item.quantity),
      BigInt(0),
    )
    .toString()
}

export function buildDisbursementFormPayload(input: {
  milestoneId: number
  purpose: string
  items: DisbursementItemDraft[]
  region?: string
}): DisbursementFormPayload {
  if (!input.purpose.trim()) {
    throw new Error("Lengkapi semua rincian penggunaan dana dengan format yang valid.")
  }

  const items = buildDisbursementItems(input.items)
  return {
    milestoneId: input.milestoneId,
    requestedAmountWei: calculateDisbursementTotalWei(items),
    description: input.purpose.trim(),
    region: input.region?.trim() || "Indonesia",
    items,
  }
}

export function calculateItemSubtotalWei(draft: DisbursementItemDraft): string | null {
  const quantity = Number(draft.quantity)
  const unitPriceWei = decimalBnbToWei(draft.unitPrice)
  if (!unitPriceWei || !Number.isInteger(quantity) || quantity <= 0) return null

  return (BigInt(unitPriceWei) * BigInt(quantity)).toString()
}
