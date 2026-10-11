import { describe, expect, it } from "vitest"

import { getPrivyProfile } from "./user-data"

describe("getPrivyProfile", () => {
  it("uses the verified email and normalizes linked Ethereum wallets", () => {
    const profile = getPrivyProfile({
      id: "did:privy:abc123",
      linked_accounts: [
        { type: "email", address: "donatur@mizan.id" },
        {
          type: "wallet",
          address: "0xAAbbCCdDeeFF0011223344556677889900aAbBcC",
          chain_type: "ethereum",
          wallet_client_type: "privy",
          id: "wallet-embedded-1",
        },
        {
          type: "wallet",
          address: "0x99887766554433221100ffeeddccbbaa99887766",
          chain_type: "ethereum",
          wallet_client_type: "metamask",
          id: "wallet-external-1",
        },
      ],
    })

    expect(profile).toEqual({
      privyId: "did:privy:abc123",
      email: "donatur@mizan.id",
      wallets: [
        {
          address: "0xaabbccddeeff0011223344556677889900aabbcc",
          chainType: "ethereum",
          walletType: "embedded",
          privyWalletId: "wallet-embedded-1",
        },
        {
          address: "0x99887766554433221100ffeeddccbbaa99887766",
          chainType: "ethereum",
          walletType: "external",
          privyWalletId: "wallet-external-1",
        },
      ],
    })
  })

  it("ignores unsupported accounts and supports wallet-only users", () => {
    const profile = getPrivyProfile({
      id: "did:privy:wallet-only",
      linked_accounts: [
        { type: "google_oauth", subject: "google-user" },
      ],
    })

    expect(profile).toEqual({
      privyId: "did:privy:wallet-only",
      email: null,
      wallets: [],
    })
  })

  it("normalizes linked Solana wallets instead of dropping them", () => {
    const profile = getPrivyProfile({
      id: "did:privy:solana-user",
      linked_accounts: [
        {
          type: "wallet",
          address: "So11111111111111111111111111111111111111112",
          chain_type: "solana",
          wallet_client_type: "phantom",
          id: "wallet-solana-1",
        },
      ],
    })

    expect(profile.wallets).toEqual([
      {
        address: "so11111111111111111111111111111111111111112",
        chainType: "solana",
        walletType: "external",
        privyWalletId: "wallet-solana-1",
      },
    ])
  })
})
