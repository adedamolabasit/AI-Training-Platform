import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";

describe("ObligationManager", () => {
    let manager: any;
    let owner: Signer;
    let provider: Signer;
    let providerAddress: string;

    before(async () => {
        [owner, provider] = await ethers.getSigners();
        providerAddress = await provider.getAddress();
        const [deployer] = await ethers.getSigners();

        const Arbiter = await ethers.getContractFactory("Arbiter");
        const ObligationManager = await ethers.getContractFactory("ObligationManager");
        
        const arbiter = await Arbiter.deploy(deployer.address, {
          gasLimit: 30_000_000,
          gasPrice: ethers.parseUnits("200", "gwei") // Higher price
        });

        const arbiterAddress =  await arbiter.getAddress()
        manager = await ObligationManager.deploy(arbiterAddress);

        // Set SLA requirements (must be done by owner)
        await manager.connect(owner).setSLARequirements(
            86400,     // minDuration: 1 day
            31536000,  // maxDuration: 1 year
            2,         // minRedundancy: 2 copies
            500        // maxRetrievalSpeed: 500ms
        );
    });

    it("Should create obligation with valid SLA", async () => {
        await manager.createObligation(
            "QmTestCID",
            providerAddress,
            31536000, // 1 year
            3,        // 3 replicas
            300       // 300ms (under 500ms limit)
        );
        
        const obligation = await manager.obligations("QmTestCID");
        expect(obligation.status).to.equal(0); // Active
    });

    it("Should reject invalid retrieval speed", async () => {
        await expect(
            manager.createObligation(
                "QmSlowCID",
                providerAddress,
                31536000,
                3,
                1000 // Exceeds 500ms limit
            )
        ).to.be.revertedWith("Retrieval speed too slow");
    });

    it("Should reject obligation with insufficient redundancy", async () => {
        await expect(
            manager.createObligation(
                "QmLowRedundancyCID",
                providerAddress,
                31536000,
                1,  // Below minimum 2
                300
            )
        ).to.be.revertedWith("Redundancy too low");
    });

    it("Should reject duplicate CID", async () => {
        await manager.createObligation(
            "QmDuplicateCID",
            providerAddress,
            31536000,
            3,
            300
        );
        
        await expect(
            manager.createObligation(
                "QmDuplicateCID", // Same CID
                providerAddress,
                31536000,
                3,
                300
            )
        ).to.be.revertedWith("Obligation already exists");
    });

    it("Should only allow owner to set SLA requirements", async () => {
        await expect(
            manager.connect(provider).setSLARequirements(1, 1, 1, 1)
        ).to.be.revertedWith("Only owner allowed");
    });
});