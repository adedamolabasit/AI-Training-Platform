import { http, createConfig } from 'wagmi'
import { arbitrumSepolia, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '0b42d47e3e6ed0398495212a848f316c'

export const config = createConfig({
  chains: [arbitrumSepolia, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(), // add transport for Ethereum Sepolia
  },
})
