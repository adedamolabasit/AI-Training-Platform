// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ObligationManager {
    enum Status { Active, Fulfilled, Broken, Expired }

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

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter allowed");
        _;
    }

    event ObligationCreated(string cid, address provider, uint256 duration, uint256 redundancy, uint256 retrievalSpeed);
    event ObligationUpdated(string cid, Status status);

    constructor(address _arbiter) {
        arbiter = _arbiter;
    }

    function createObligation(
        string memory cid,
        address provider,
        uint256 duration,
        uint256 redundancy,
        uint256 retrievalSpeed
    ) external {
        require(obligations[cid].startTime == 0, "Obligation already exists");
        obligations[cid] = Obligation({
            cid: cid,
            provider: provider,
            startTime: block.timestamp,
            duration: duration,
            redundancy: redundancy,
            retrievalSpeed: retrievalSpeed,
            status: Status.Active
        });
        emit ObligationCreated(cid, provider, duration, redundancy, retrievalSpeed);
    }

    function updateStatus(string memory cid, Status newStatus) external onlyArbiter {
        require(obligations[cid].startTime != 0, "Obligation does not exist");
        obligations[cid].status = newStatus;
        emit ObligationUpdated(cid, newStatus);
    }
}