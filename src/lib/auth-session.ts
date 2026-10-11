import type { OnboardingUserType, UserRole } from "./role-dashboard"

export const DASHBOARD_SESSION_COOKIE = "mizan_dashboard_session"
export const DASHBOARD_SESSION_MAX_AGE = 60 * 60

export type DashboardSession = {
  expiresAt: number
  privyId: string
  role: UserRole
  userType: OnboardingUserType | null
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBase64Url = (value: Uint8Array) => {
  let binary = ""

  for (const byte of value) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")
}

const fromBase64Url = (value: string) => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(`${base64}${padding}`)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

const getSigningKey = () => {
  const secret = process.env.PRIVY_APP_SECRET

  if (!secret) {
    throw new Error("Missing required environment variable: PRIVY_APP_SECRET")
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

const sign = async (payload: string) => {
  const key = await getSigningKey()
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))

  return toBase64Url(new Uint8Array(signature))
}

export async function createDashboardSession(
  user: Omit<DashboardSession, "expiresAt">
) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        ...user,
        expiresAt: Date.now() + DASHBOARD_SESSION_MAX_AGE * 1000,
      } satisfies DashboardSession)
    )
  )

  return `${payload}.${await sign(payload)}`
}

export async function readDashboardSession(
  value: string | undefined
): Promise<DashboardSession | null> {
  if (!value) {
    return null
  }

  const [payload, signature, ...extraParts] = value.split(".")

  if (!payload || !signature || extraParts.length > 0) {
    return null
  }

  try {
    const key = await getSigningKey()
    const signatureBytes = fromBase64Url(signature)
    if (
      toBase64Url(signatureBytes) !== signature ||
      toBase64Url(fromBase64Url(payload)) !== payload
    ) {
      return null
    }
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    )

    if (!isValid) {
      return null
    }

    const session = JSON.parse(
      decoder.decode(fromBase64Url(payload))
    ) as DashboardSession

    if (
      typeof session.privyId !== "string" ||
      !isKnownRole(session.role) ||
      !isKnownUserType(session.userType) ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return null
    }

    return session
  } catch {
    return null
  }
}

const isKnownRole = (role: unknown): role is UserRole =>
  role === "USER" ||
  role === "ADMIN" ||
  role === "BENEFACTOR" ||
  role === "BENEFICIARY" ||
  role === "BENEFACTORY"

const isKnownUserType = (
  userType: unknown
): userType is OnboardingUserType | null =>
  userType === null ||
  userType === "DONOR" ||
  userType === "BENEFICIARY" ||
  userType === "ORGANIZATION"
