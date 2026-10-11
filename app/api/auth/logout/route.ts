import { NextResponse } from "next/server"

import { DASHBOARD_SESSION_COOKIE } from "@/src/lib/auth-session"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: DASHBOARD_SESSION_COOKIE,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
