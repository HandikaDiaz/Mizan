import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it } from "vitest"

import { createDashboardSession, DASHBOARD_SESSION_COOKIE } from "./src/lib/auth-session"
import { proxy } from "./proxy"

const requestFor = (path: string, session?: string) =>
  new NextRequest(`https://mizan.test${path}`, {
    headers: session
      ? { cookie: `${DASHBOARD_SESSION_COOKIE}=${session}` }
      : undefined,
  })

describe("dashboard proxy", () => {
  beforeEach(() => {
    process.env.PRIVY_APP_SECRET = "test-session-secret"
  })

  it("allows a role to access its own dashboard", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:donor",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    const response = await proxy(requestFor("/benefactor", session))

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("allows admin to access any role route", async () => {
    const adminSession = await createDashboardSession({
      privyId: "did:privy:admin",
      role: "ADMIN",
      userType: null,
    })

    const respAdmin = await proxy(requestFor("/admin", adminSession))
    expect(respAdmin.headers.get("x-middleware-next")).toBe("1")

    const respBenefactor = await proxy(requestFor("/benefactor", adminSession))
    expect(respBenefactor.headers.get("x-middleware-next")).toBe("1")

    const respBeneficiary = await proxy(requestFor("/beneficiary/campaigns", adminSession))
    expect(respBeneficiary.headers.get("x-middleware-next")).toBe("1")
  })

  it("allows beneficiary to access (beneficiary) folder routes", async () => {
    const beneficiarySession = await createDashboardSession({
      privyId: "did:privy:beneficiary",
      role: "BENEFICIARY",
      userType: "BENEFICIARY",
    })

    const response = await proxy(requestFor("/beneficiary/campaigns", beneficiarySession))

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("sends a beneficiary opening admin or benefactor routes back to beneficiary dashboard", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:beneficiary",
      role: "BENEFICIARY",
      userType: "BENEFICIARY",
    })

    const responseAdmin = await proxy(requestFor("/admin", session))
    expect(responseAdmin.headers.get("location")).toBe("https://mizan.test/beneficiary")

    const responseBenefactor = await proxy(requestFor("/benefactor", session))
    expect(responseBenefactor.headers.get("location")).toBe("https://mizan.test/beneficiary")
  })

  it("sends a benefactor opening admin or beneficiary routes back to benefactor dashboard", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:donor",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    const response = await proxy(requestFor("/admin", session))

    expect(response.headers.get("location")).toBe("https://mizan.test/benefactor")
  })

  it("sends an unauthenticated dashboard request to the public landing page", async () => {
    const response = await proxy(requestFor("/beneficiary/campaigns"))

    expect(response.headers.get("location")).toBe(
      "https://mizan.test/?next=%2Fbeneficiary%2Fcampaigns"
    )
  })

  it("resolves the dashboard shortcut from the authenticated role", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:admin",
      role: "ADMIN",
      userType: null,
    })

    const response = await proxy(requestFor("/dashboard", session))

    expect(response.headers.get("location")).toBe("https://mizan.test/admin")
  })
})
