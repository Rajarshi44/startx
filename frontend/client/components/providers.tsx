/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  createConfig,
  http,
} from 'wagmi';
import { metaMask, injected } from 'wagmi/connectors';
import { CivicAuthProvider } from '@civic/auth-web3/react';
import { mainnet, sepolia } from "wagmi/chains";

const CLIENT_ID = process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "591fba43-f526-4a18-b303-e0ad4dd98bd9";

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    metaMask(),
    injected(),
  ],
});

// Wagmi requires react-query
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig as any}>
        <CivicAuthProvider 
          clientId={CLIENT_ID}
          config={{ 
            oauthServer: process.env.NEXT_PUBLIC_CIVIC_AUTH_SERVER || 'https://auth.civic.com/oauth'
          }}
          endpoints={{ 
            wallet: process.env.NEXT_PUBLIC_CIVIC_WALLET_API_BASE_URL 
          }}
        >
          {children}
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
} 