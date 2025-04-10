// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    arbitrumSepolia: {
      url: `${process.env.ALCHEMY_API_URL}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

module.exports = config;