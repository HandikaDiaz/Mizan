import { beforeEach, describe, expect, it } from "vitest"

import {
  createDashboardSession,
  readDashboardSession,
} from "./auth-session"

describe("dashboard session", () => {
  beforeEach(() => {
    process.env.PRIVY_APP_SECRET = "test-session-secret"
  })

  it("reads a session that was signed by the server", async () => {
    const value = await createDashboardSession({
      privyId: "did:privy:test-user",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    await expect(readDashboardSession(value)).resolves.toMatchObject({
      privyId: "did:privy:test-user",
      role: "BENEFACTOR",
      userType: "DONOR",
    })
  })

  it("rejects a modified session", async () => {
    const value = await createDashboardSession({
      privyId: "did:privy:test-user",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    const tampered = `${value.slice(0, -1)}${value.endsWith("a") ? "b" : "a"}`

    await expect(readDashboardSession(tampered)).resolves.toBeNull()
  })
})
