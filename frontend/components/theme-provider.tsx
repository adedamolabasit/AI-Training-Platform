"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { arbitrumSepolia, sepolia } from "viem/chains"; // Importing both chains

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const config = createConfig({
    chains: [arbitrumSepolia, sepolia], // Added Ethereum Sepolia
    multiInjectedProviderDiscovery: false,
    transports: {
      [arbitrumSepolia.id]: http(),
      [sepolia.id]: http(), // Added transport for Ethereum Sepolia
    },
  });

  const queryClient = new QueryClient();

  return (
    <NextThemesProvider {...props}>
      <DynamicContextProvider
        settings={{
          environmentId: "2935179e-0f14-443a-b82c-e98f12e7046a",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </NextThemesProvider>
  );
}
