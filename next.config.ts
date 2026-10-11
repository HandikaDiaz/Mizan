import type { NextConfig } from "next"

// Allow next/image to load campaign cover images uploaded to Supabase Storage.
// The Supabase project host is derived from NEXT_PUBLIC_SUPABASE_URL.
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined
  } catch {
    return undefined
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "asset.ayobantu.com",
        pathname: "/campaign/**",
      },
    ],
  },
}

export default nextConfig
