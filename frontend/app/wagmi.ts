import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains' // or from 'viem/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '0b42d47e3e6ed0398495212a848f316c'

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
})
