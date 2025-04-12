const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ObligationManager", () => {
  let manager;
  let arbiter;
  let owner;
  let provider;

  before(async () => {
    // Get signers
    [owner, provider] = await ethers.getSigners();

    const Arbiter = await ethers.getContractFactory("Arbiter");
    arbiter = await Arbiter.deploy(owner.address, {
      gasLimit: 30_000_000,
      gasPrice: ethers.parseUnits("150", "gwei"),
    });
    await arbiter.waitForDeployment();

    const ObligationManager = await ethers.getContractFactory(
      "ObligationManager"
    );
    manager = await ObligationManager.deploy(await arbiter.getAddress(), {
      gasLimit: 30_000_000,
      gasPrice: ethers.parseUnits("150", "gwei"),
    });
    await manager.waitForDeployment();
  });

  it("Should create an obligation", async () => {
    const tx = await manager.createObligation(
      "QmXYZ",
      provider.address,
      365,
      3,
      500
    );
    await tx.wait();

    const obligation = await manager.obligations("QmXYZ");
    expect(obligation.status).to.equal(0);
    expect(obligation.provider).to.equal(provider.address);
  });
});
