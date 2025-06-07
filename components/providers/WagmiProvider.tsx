import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'
import {  Celo } from "@celo/rainbowkit-celo/chains";
// Create a custom config with error handling
export const config = createConfig({
  chains: [Celo],
  transports: {
    [Celo.id]: http(),
  },
  connectors: [ miniAppConnector(), injected() ],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
