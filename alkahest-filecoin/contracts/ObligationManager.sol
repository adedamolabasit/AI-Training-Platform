// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ObligationManager {
    enum Status {
        Active,
        Fulfilled,
        Broken,
        Expired
    }

    struct SLA {
        uint256 minDuration;
        uint256 maxDuration;
        uint256 minRedundancy;
        uint256 maxRetrievalSpeed;
    }

    SLA public slaRequirements;

    struct Obligation {
        string cid;
        address provider;
        uint256 startTime;
        uint256 duration;
        uint256 redundancy;
        uint256 retrievalSpeed; // in ms
        Status status;
    }

    mapping(string => Obligation) public obligations;
    address public arbiter;
    address public owner; // Added owner variable

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter allowed");
        _;
    }

    modifier onlyOwner() {
        // Added owner modifier
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    event ObligationCreated(
        string cid,
        address provider,
        uint256 duration,
        uint256 redundancy,
        uint256 retrievalSpeed
    );
    event ObligationUpdated(string cid, Status status);

    constructor(address _arbiter) {
        arbiter = _arbiter;
        owner = msg.sender; // Set deployer as owner
    }

    function setSLARequirements(
        uint256 minDuration,
        uint256 maxDuration,
        uint256 minRedundancy,
        uint256 maxRetrievalSpeed
    ) external onlyOwner {
        slaRequirements = SLA(
            minDuration,
            maxDuration,
            minRedundancy,
            maxRetrievalSpeed
        );
    }

    function createObligation(
        string memory cid,
        address provider,
        uint256 duration,
        uint256 redundancy,
        uint256 retrievalSpeed
    ) external {
        obligations[cid] = Obligation({
            cid: cid,
            provider: provider,
            startTime: block.timestamp,
            duration: duration,
            redundancy: redundancy,
            retrievalSpeed: retrievalSpeed,
            status: Status.Active
        });
        emit ObligationCreated(
            cid,
            provider,
            duration,
            redundancy,
            retrievalSpeed
        );
    }

    function getObligationByCID(
        string memory cid
    )
        external
        view
        returns (
            string memory,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            Status
        )
    {
        Obligation memory obligation = obligations[cid];
        return (
            obligation.cid,
            obligation.provider,
            obligation.startTime,
            obligation.duration,
            obligation.redundancy,
            obligation.retrievalSpeed,
            obligation.status
        );
    }

    function updateStatus(
        string memory cid,
        Status newStatus
    ) external onlyArbiter {
        require(obligations[cid].startTime != 0, "Obligation does not exist");
        obligations[cid].status = newStatus;
        emit ObligationUpdated(cid, newStatus);
    }
}
