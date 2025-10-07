"use client";

import { Core } from "@walletconnect/core";
import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create WalletConnect core
const core = new Core({
  projectId,
});

// Create the query client
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "MysteryBox",
  description: "MysteryBox Platform on Celo",
  url: "https://mystery-box.vercel.app/",
  icons: ["/logo.svg"]
};
// Create Wagmi Adapter with WalletConnect
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [celo] 
})

// Export the config for other components
export const config = wagmiAdapter.wagmiConfig;

export function WagmiContext({ children, cookies }: { children: React.ReactNode, cookies?: string | null }) {
  const initialState = cookies ? cookieToInitialState(config as Config, cookies) : undefined;

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}