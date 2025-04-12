// contracts/Test.sol
pragma solidity ^0.8.20;
contract Test {
    constructor() payable {
        require(msg.value == 0, "This constructor should work with 0 value");
    }
}