// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IObligationManager {
    function updateStatus(string calldata cid, uint8 newStatus) external;
}

contract Arbiter {
    address public obligationManager;
    address public owner;

    constructor(address _manager) {
        obligationManager = _manager;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    function verifyFilecoinProof(
        string calldata cid,
        bool proofValid,
        bool timelyRetrieved
    ) external onlyOwner {
        uint8 status = proofValid && timelyRetrieved ? 1 : 2; // 1=Fulfilled, 2=Broken
        IObligationManager(obligationManager).updateStatus(cid, status);
    }

    function updateManager(address newManager) external onlyOwner {
        obligationManager = newManager;
    }
}