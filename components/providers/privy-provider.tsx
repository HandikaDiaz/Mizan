'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { bscTestnet } from 'viem/chains';

import { AuthSync } from '@/components/auth/auth-sync';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
            clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID as string}
            config={{
                "supportedChains": [bscTestnet],
                "defaultChain": bscTestnet,
                "appearance": {
                    "accentColor": "#6A6FF5",
                    "theme": "#FFFFFF",
                    "showWalletLoginFirst": false,
                    "logo": "https://auth.privy.io/logos/privy-logo.png"
                },
                "loginMethods": [
                    "email",
                    "wallet",
                    "google",
                    "apple",
                    "github",
                    "discord",
                    "telegram",
                    "tiktok"
                ],
                "embeddedWallets": {
                    "showWalletUIs": true,
                    "ethereum": {
                        "createOnLogin": "users-without-wallets"
                    },
                    "solana": {
                        "createOnLogin": "users-without-wallets"
                    }
                },
                "mfa": {
                    "noPromptOnMfaRequired": false
                }
            }}
        >
            <AuthSync />
            {children}
        </PrivyProvider>
    );
}
