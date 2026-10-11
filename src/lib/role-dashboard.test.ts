import { describe, expect, it } from "vitest"

import {
  getDashboardPath,
  getOnboardingUserType,
  getPostAuthRedirectPath,
  getRoleDashboardPath,
  getRoleForOnboardingUserType,
} from "./role-dashboard"

describe("role dashboard routing", () => {
  it.each([
    ["ADMIN", undefined, "/admin"],
    ["BENEFACTOR", undefined, "/benefactor"],
    ["BENEFICIARY", undefined, "/beneficiary"],
    ["BENEFACTOR", "BENEFACTOR", "/benefactor"],
    ["BENEFACTOR", "DONOR", "/benefactor"],
    ["BENEFICIARY", "BENEFICIARY", "/beneficiary"],
  ])("routes %s/%s to %s", (role, userType, expectedPath) => {
    expect(getDashboardPath(role, userType)).toBe(expectedPath)
  })

  it("keeps an incomplete account on a dashboard using its user type", () => {
    expect(getDashboardPath(undefined, "BENEFACTOR")).toBe("/benefactor")
    expect(getDashboardPath(undefined, "DONOR")).toBe("/benefactor")
    expect(getDashboardPath(undefined, "BENEFICIARY")).toBe("/beneficiary")
    expect(getDashboardPath(null, null)).toBe("/benefactor")
  })

  it("maps onboarding choices to non-admin application roles", () => {
    expect(getRoleForOnboardingUserType("BENEFACTOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("DONOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("BENEFICIARY")).toBe("BENEFICIARY")
  })

  it("only maps complete application roles to protected dashboards", () => {
    expect(getRoleDashboardPath("ADMIN")).toBe("/admin")
    expect(getRoleDashboardPath("BENEFACTOR")).toBe("/benefactor")
    expect(getRoleDashboardPath("BENEFICIARY")).toBe("/beneficiary")
    expect(getRoleDashboardPath("USER")).toBeNull()
    expect(getRoleDashboardPath(null)).toBeNull()
  })

  it("resolves the generic dashboard callback to the beneficiary dashboard", () => {
    expect(getPostAuthRedirectPath("/dashboard", "BENEFICIARY")).toBe(
      "/beneficiary",
    )
  })

  it("preserves a valid role-specific callback path", () => {
    expect(getPostAuthRedirectPath("/beneficiary/campaigns", "BENEFICIARY")).toBe(
      "/beneficiary/campaigns",
    )
    expect(getPostAuthRedirectPath("/settings", "BENEFICIARY")).toBeNull()
  })

  it("only accepts known onboarding user types", () => {
    expect(getOnboardingUserType("DONOR")).toBe("DONOR")
    expect(getOnboardingUserType("BENEFICIARY")).toBe("BENEFICIARY")
    expect(getOnboardingUserType("UNKNOWN")).toBeNull()
  })
})
