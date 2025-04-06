const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying DataSets contract...");
  
  const DataSet = await ethers.getContractFactory("DataSet");
  
  const contract = await DataSet.deploy();
  
  await contract.waitForDeployment();
  
  console.log(`DataSet deployed to: ${await contract.getAddress()}`);
  
  return contract;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});