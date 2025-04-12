// scripts/deploy-arbiter-only.ts
import { ethers } from "hardhat";

async function main() {
  const ObligationManager = await ethers.getContractFactory("ObligationManager");
  const manager = await ObligationManager.deploy("0xa53eec2fc82ffC91C8417f015B65f3800E9C5b07", { // Dummy address
    gasLimit: 150000,
    gasPrice: ethers.parseUnits("150", "gwei")
  });
  console.log("Obligation deployed:", await manager.getAddress());
}
main().catch(console.error);