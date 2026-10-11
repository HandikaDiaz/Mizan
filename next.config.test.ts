import { describe, expect, it } from "vitest"

import nextConfig from "./next.config"

describe("Next.js image configuration", () => {
  it("allows campaign assets from the Ayobantu asset host", () => {
    expect(nextConfig.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        {
          protocol: "https",
          hostname: "asset.ayobantu.com",
          pathname: "/campaign/**",
        },
      ])
    )
  })
})
