const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying DataSets contract...");
  
  const DataSets = await ethers.getContractFactory("DataSets");
  
  const contract = await DataSets.deploy();
  
  await contract.waitForDeployment();
  
  console.log(`DataSets deployed to: ${await contract.getAddress()}`);
  
  return contract;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});