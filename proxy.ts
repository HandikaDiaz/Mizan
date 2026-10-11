import { NextResponse, type NextRequest } from "next/server"

import {
  DASHBOARD_SESSION_COOKIE,
  readDashboardSession,
} from "./src/lib/auth-session"
import { getRoleDashboardPath } from "./src/lib/role-dashboard"

const requiredRoleByPrefix = [
  ["/admin", "ADMIN"],
  ["/benefactor", "BENEFACTOR"],
  ["/beneficiary", "BENEFICIARY"],
] as const

const redirectToHome = (request: NextRequest) => {
  const url = request.nextUrl.clone()
  url.pathname = "/"
  if (!url.searchParams.has("next")) {
    url.searchParams.set("next", request.nextUrl.pathname)
  }
  return withCoopHeader(NextResponse.redirect(url))
}

const withCoopHeader = (response: NextResponse) => {
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Abaikan asset statis, API internal, atau file sistem agar tidak memicu error 404
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const session = await readDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value
  )
  const dashboardPath = session ? getRoleDashboardPath(session.role) : null

  // Jika mengakses halaman /dashboard umum
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!session || !dashboardPath) {
      return redirectToHome(request)
    }

    const url = request.nextUrl.clone()
    url.pathname = dashboardPath
    return NextResponse.redirect(url)
  }

  // Jika mengakses onboarding
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    if (!session) {
      return redirectToHome(request)
    }
    return withCoopHeader(NextResponse.next())
  }

  const requiredRole = requiredRoleByPrefix.find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )?.[1]

  // Jika rute tidak memerlukan role khusus, izinkan lewat dengan header COOP
  if (!requiredRole) {
    return withCoopHeader(NextResponse.next())
  }

  // Jika butuh role tapi belum login / session tidak valid
  if (!session || !dashboardPath) {
    return redirectToHome(request)
  }

  // Role ADMIN
  if (session.role === "ADMIN") {
    return withCoopHeader(NextResponse.next())
  }

  // Jika role user tidak sesuai dengan rute yang diakses
  if (session.role !== requiredRole) {
    const url = request.nextUrl.clone()
    url.pathname = dashboardPath
    return NextResponse.redirect(url)
  }

  return withCoopHeader(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}