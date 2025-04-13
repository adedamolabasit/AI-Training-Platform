import "@nomicfoundation/hardhat-toolbox";
import '@nomicfoundation/hardhat-ethers';
import { HardhatUserConfig } from "hardhat/config";

import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { 
        enabled: true,
        runs: 200
      },
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/2hpcKFDRxgibUMfmc8jxG77IYTLRea0r",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;