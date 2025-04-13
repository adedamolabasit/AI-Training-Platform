import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer,"deployer")
  
  // 1. Deploy Arbiter (minimal)
  const Arbiter = await ethers.getContractFactory("Arbiter");
  const arbiter = await Arbiter.deploy("0x088190EE1Bd2108B91b29d3c9a7B3127db73AEcc", { // Dummy address
    gasLimit: 100000,
    gasPrice: ethers.parseUnits("150", "gwei")
  });
  const arbiterAddress =  await arbiter.getAddress();
  console.log(arbiterAddress)
  const ObligationManager = await ethers.getContractFactory("ObligationManager");
  const manager = await ObligationManager.deploy(arbiterAddress, { 
    gasLimit: 150000,
    gasPrice: ethers.parseUnits("150", "gwei")
  });
  console.log("Obligation deployed:", await manager.getAddress());
  await manager.setSLARequirements(
    86400,    // min 1 day
    31536000, // max 1 year
    2,        // min 2 replicas
    500       // max 500ms retrieval
  );
}

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



main().catch((error) => {
  console.error("Error:", error.reason || error.message);
  process.exit(1);
});