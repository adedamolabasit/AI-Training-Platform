import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log(deployer,"deployer")
  
  const Arbiter = await ethers.getContractFactory("Arbiter");
  const arbiter = await Arbiter.deploy("0x088190EE1Bd2108B91b29d3c9a7B3127db73AEcc");
  const arbiterAddress =  await arbiter.getAddress();
  console.log("Arbiter deployed:", arbiterAddress)
  const ObligationManager = await ethers.getContractFactory("ObligationManager");
  const manager = await ObligationManager.deploy(arbiterAddress);
  console.log("Obligation deployed:", await manager.getAddress());
  await manager.setSLARequirements(
    86400,    // min 1 day
    31536000, // max 1 year
    2,        // min 2 replicas
    500       // max 500ms retrieval
  );
}

main().catch((error) => {
  console.error("Error:", error.reason || error.message);
  process.exit(1);
});