import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const managerAddress = "0xBe96AAbccADF14b0F91B4B4506162AF341A07507"; // Replace with deployed address
  const managerABI = ["function createObligation(string,address,uint256,uint256,uint256)"];
  const manager = new ethers.Contract(managerAddress, managerABI, wallet);

  // Create an obligation
  await manager.createObligation("QmXYZ", wallet.address, 365, 3, 500);
  console.log("Obligation created!");
}

main().catch(console.error);