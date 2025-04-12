import { ethers } from 'hardhat';


async function main() {
const Test = await ethers.getContractFactory("Test");
const test = await Test.deploy({ gasLimit: 5_000_000 });
console.log("Test deployed to:", await test.getAddress());
}

main().catch(console.error)