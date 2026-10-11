import { describe, expect, it } from "vitest"

import {
  canTransitionDisbursementRequest,
  getDisbursementAdminActions,
  isActiveDisbursementStatus,
  transitionDisbursementRequest,
} from "./disbursement-workflow"

describe("disbursement request state machine", () => {
  it("accepts every transition in the approved lifecycle", () => {
    expect(canTransitionDisbursementRequest("SUBMITTED", "AI_VERIFIED")).toBe(true)
    expect(canTransitionDisbursementRequest("SUBMITTED", "MANUAL_REVIEW")).toBe(true)
    expect(canTransitionDisbursementRequest("AI_VERIFIED", "ADMIN_APPROVED")).toBe(true)
    expect(canTransitionDisbursementRequest("ADMIN_APPROVED", "CHAIN_PENDING")).toBe(true)
    expect(canTransitionDisbursementRequest("CHAIN_PENDING", "DISBURSED")).toBe(true)
    expect(canTransitionDisbursementRequest("CHAIN_PENDING", "CHAIN_FAILED")).toBe(true)
    expect(canTransitionDisbursementRequest("CHAIN_FAILED", "CHAIN_PENDING")).toBe(true)
  })

  it("keeps terminal states terminal and rejects skips", () => {
    expect(canTransitionDisbursementRequest("REJECTED", "SUBMITTED")).toBe(false)
    expect(canTransitionDisbursementRequest("DISBURSED", "CHAIN_PENDING")).toBe(false)
    expect(() => transitionDisbursementRequest("AI_VERIFIED", "DISBURSED")).toThrow(
      "Transisi pencairan tidak valid",
    )
  })

  it("treats rejected and disbursed requests as inactive", () => {
    expect(isActiveDisbursementStatus("CHAIN_FAILED")).toBe(true)
    expect(isActiveDisbursementStatus("REJECTED")).toBe(false)
    expect(isActiveDisbursementStatus("DISBURSED")).toBe(false)
  })

  it("maps statuses to the minimal admin actions", () => {
    expect(getDisbursementAdminActions("AI_VERIFIED")).toEqual(["APPROVE", "REJECT"])
    expect(getDisbursementAdminActions("MANUAL_REVIEW")).toEqual(["APPROVE", "REJECT"])
    expect(getDisbursementAdminActions("ADMIN_APPROVED")).toEqual(["RELEASE"])
    expect(getDisbursementAdminActions("CHAIN_PENDING")).toEqual(["CHECK"])
    expect(getDisbursementAdminActions("CHAIN_FAILED")).toEqual(["RETRY"])
  })
})
