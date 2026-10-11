"use client"

import { useEffect, useRef, useState } from "react"
import { useIdentityToken, usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

import {
  getPostAuthRedirectPath,
  getRoleDashboardPath,
} from "@/src/lib/role-dashboard"

type AuthSyncResponse = {
  onboardingRequired?: boolean
  syncSkipped?: boolean
  error?: string
  details?: string
  user?: {
    role?: string | null
    userType?: string | null
  }
}

const MAX_SYNC_RETRIES = 10

export function AuthSync() {
  const { authenticated, ready, user } = usePrivy()
  const { identityToken } = useIdentityToken()
  const router = useRouter()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncRetryCount, setSyncRetryCount] = useState(0)
  const inFlightRequests = useRef(new Set<string>())
  const linkedAccountSignature =
    user?.linkedAccounts
      .map((account) => {
        const address =
          "address" in account && typeof account.address === "string"
            ? account.address
            : ""
        return `${account.type}:${address}`
      })
      .join("|") ?? ""

  useEffect(() => {
    if (!ready || !authenticated || !identityToken) {
      return
    }

    const requestKey = `${identityToken}:${linkedAccountSignature}`

    if (inFlightRequests.current.has(requestKey)) {
      return
    }

    inFlightRequests.current.add(requestKey)
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const syncUser = async () => {
      try {
        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "privy-id-token": identityToken,
          },
        })

        const body = (await response
          .json()
          .catch(() => null)) as AuthSyncResponse | null

        if (!response.ok) {
          throw new Error(
            `Auth sync failed with status ${response.status}: ${body?.error ?? "UNKNOWN_ERROR"}${body?.details ? ` (${body.details})` : ""}`
          )
        }

        setSyncError(null)
        const needsOnboarding = body?.onboardingRequired === true

        if (body?.syncSkipped) {
          if (syncRetryCount < MAX_SYNC_RETRIES) {
            retryTimer = setTimeout(() => {
              setSyncRetryCount((current) => current + 1)
            }, 1500)
          } else {
            setSyncError(
              "Role belum dapat dibaca. Pastikan database Mizan aktif, lalu muat ulang halaman."
            )
          }
          return
        }

        const currentPath = window.location.pathname

        if (needsOnboarding) {
          if (!currentPath.startsWith("/onboarding")) {
            router.replace("/onboarding/role")
          }
        } else {
          if (currentPath.startsWith("/onboarding")) {
            const targetPath = getRoleDashboardPath(body?.user?.role) ?? "/campaigns"
            router.replace(targetPath)
          } else {
            const nextPath = new URLSearchParams(window.location.search).get("next")
            const targetPath = getPostAuthRedirectPath(
              nextPath,
              body?.user?.role,
              body?.user?.userType,
            )
            if (targetPath) {
              router.replace(targetPath)
            }
          }
        }

      } catch {
        // Sync is optional for the public page. A missing local database must
        // not cover the landing page with an error banner.
        setSyncError(null)
      } finally {
        inFlightRequests.current.delete(requestKey)
      }
    }

    void syncUser()

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
    }
  }, [
    authenticated,
    identityToken,
    linkedAccountSignature,
    ready,
    router,
    syncRetryCount,
  ])

  return (
    <>
      {syncError ? (
        <p
          className="fixed inset-x-4 bottom-4 z-[60] rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral shadow-lg"
          role="alert"
        >
          {syncError}
        </p>
      ) : null}
    </>
  )
}
