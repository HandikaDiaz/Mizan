import type { DisbursementRequestItem } from "./disbursement"

export type MilestoneAmountInput = {
  amountWei: string
}

export type AmountValidationResult = {
  valid: boolean
  totalWei: string
  error: string | null
}

const isPositiveWei = (value: string) => /^\d+$/.test(value) && BigInt(value) > BigInt(0)

export function validateMilestoneAmounts(
  milestones: MilestoneAmountInput[],
  targetAmountWei: string,
): AmountValidationResult {
  if (!isPositiveWei(targetAmountWei)) {
    return { valid: false, totalWei: "0", error: "Target campaign harus berupa wei positif." }
  }
  if (milestones.length === 0 || milestones.some((item) => !isPositiveWei(item.amountWei))) {
    return { valid: false, totalWei: "0", error: "Setiap milestone harus memiliki wei positif." }
  }

  const total = milestones.reduce(
    (sum, milestone) => sum + BigInt(milestone.amountWei),
    BigInt(0),
  )
  if (total !== BigInt(targetAmountWei)) {
    return {
      valid: false,
      totalWei: total.toString(),
      error: "Total milestone harus sama dengan target campaign.",
    }
  }
  return { valid: true, totalWei: total.toString(), error: null }
}

export function validateRequestAmount(
  milestoneAmountWei: string,
  requestedAmountWei: string,
): boolean {
  return isPositiveWei(milestoneAmountWei) && requestedAmountWei === milestoneAmountWei
}

export function validateRequestItems(
  items: DisbursementRequestItem[],
  expectedTotalWei: string,
): boolean {
  if (!isPositiveWei(expectedTotalWei) || items.length === 0) return false
  const total = items.reduce(
    (sum, item) => sum + BigInt(item.quantity) * BigInt(item.unitPriceWei),
    BigInt(0),
  )
  return total === BigInt(expectedTotalWei)
}

export function getActiveRequestKey(milestoneId: number): string {
  if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
    throw new Error("Milestone ID tidak valid.")
  }
  return `milestone:${milestoneId}`
}

export function createDisbursementIdempotencyKey(): string {
  return `disbursement:${crypto.randomUUID()}`
}
