import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer,"deployer")
  
  // 1. Deploy Arbiter (minimal)
  const Arbiter = await ethers.getContractFactory("Arbiter");
  const arbiter = await Arbiter.deploy(deployer.address, {
    gasLimit: 30_000_000,
    gasPrice: ethers.parseUnits("200", "gwei") // Higher price
  });
  await arbiter.waitForDeployment();
  console.log("Arbiter:", await arbiter.getAddress());

//   // 2. Deploy ObligationManager (no constructor logic)
//   const ObligationManager = await ethers.getContractFactory("ObligationManager");
//   const managerTx = await ObligationManager.getDeployTransaction(await arbiter.getAddress());
//   const estimatedGas = await ethers.provider.estimateGas(managerTx);
  
//   const manager = await ObligationManager.deploy(await arbiter.getAddress(), {
//     gasLimit: estimatedGas * 2n, // 100% buffer
//     gasPrice: ethers.parseUnits("200", "gwei")
//   });
//   await manager.waitForDeployment();
//   console.log("ObligationManager:", await manager.getAddress());
}

main().catch((error) => {
  console.error("Error:", error.reason || error.message);
  process.exit(1);
});