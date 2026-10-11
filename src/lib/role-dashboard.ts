export type UserRole = "BENEFACTOR" | "BENEFICIARY" | "ADMIN"
export type OnboardingUserType = "BENEFACTOR" | "BENEFICIARY" | "DONOR"

/**
 * Menentukan halaman awal setelah autentikasi selesai.
 * Tipe profil dipakai sebagai fallback selama onboarding belum selesai.
 */
export function getDashboardPath(
  role?: string | null,
  userType?: string | null,
): string {
  const roleDashboardPath = getRoleDashboardPath(role)

  if (roleDashboardPath) {
    return roleDashboardPath
  }

  switch (userType) {
    case "BENEFICIARY":
    case "ORGANIZATION":
      return "/beneficiary"
    case "DONOR":
    default:
      return "/benefactor"
  }
}

export function getRoleDashboardPath(role?: string | null): string | null {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "BENEFACTOR":
      return "/benefactor"
    case "BENEFICIARY":
      return "/beneficiary"
    default:
      return null
  }
}

export function getPostAuthRedirectPath(
  nextPath: string | null,
  role?: string | null,
  userType?: string | null,
): string | null {
  if (nextPath === "/dashboard") {
    return getDashboardPath(role, userType)
  }

  if (nextPath && /^\/(admin|benefactor|beneficiary)(?:\/|$)/.test(nextPath)) {
    return nextPath
  }

  return null
}

export function getOnboardingUserType(
  userType?: string | null
): OnboardingUserType | null {
  switch (userType) {
    case "DONOR":
      return "DONOR"
    case "BENEFICIARY":
      return "BENEFICIARY"
    case "BENEFACTOR":
    default:
      return null
  }
}

export function getRoleForOnboardingUserType(
  userType: OnboardingUserType,
): Exclude<UserRole, "ADMIN"> {
  return userType === "BENEFICIARY" ? "BENEFICIARY" : "BENEFACTOR"
}
