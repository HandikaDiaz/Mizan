type PrivyLinkedAccount = {
  address?: string | null
  chain_type?: string
  id?: string | null
  subject?: string
  type: string
  wallet_client_type?: string
}

type PrivyUserLike = {
  id: string
  linked_accounts: readonly PrivyLinkedAccount[]
}

export type PrivyWalletProfile = {
  address: string
  chainType: "ethereum" | "solana"
  privyWalletId: string | null
  walletType: "embedded" | "external"
}

export type PrivyProfile = {
  email: string | null
  privyId: string
  wallets: PrivyWalletProfile[]
}

export const getPrivyProfile = (user: PrivyUserLike): PrivyProfile => {
  const emailAccount = user.linked_accounts.find(
    (account) => account.type === "email" && typeof account.address === "string",
  )

  const wallets: PrivyWalletProfile[] = user.linked_accounts.flatMap((account) => {
    const chainType = account.chain_type

    if (
      account.type !== "wallet" ||
      (chainType !== "ethereum" && chainType !== "solana") ||
      typeof account.address !== "string"
    ) {
      return []
    }

    return [
      {
        address: account.address.toLowerCase(),
        chainType,
        privyWalletId: account.id ?? null,
        walletType:
          account.wallet_client_type === "privy"
            ? ("embedded" as const)
            : ("external" as const),
      },
    ]
  })

  return {
    email: emailAccount?.address ?? null,
    privyId: user.id,
    wallets,
  }
}
