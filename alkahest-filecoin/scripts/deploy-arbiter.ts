// scripts/deploy-arbiter-only.ts
import { ethers } from "hardhat";

async function main() {
  const Arbiter = await ethers.getContractFactory("Arbiter");
  const arbiter = await Arbiter.deploy("0x088190EE1Bd2108B91b29d3c9a7B3127db73AEcc", { // Dummy address
    gasLimit: 100000,
    gasPrice: ethers.parseUnits("150", "gwei")
  });
  console.log("Arbiter deployed:", await arbiter.getAddress());
}
main().catch(console.error);