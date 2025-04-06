// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataSet {
    struct Metadata {
        string cid;
        string name;
        string domain;
        string license;
        string access;
    }

    mapping(string => Metadata) private _cidToMetadata;

    mapping(string => address) private _cidToOwner;

    mapping(address => string[]) private _ownerToCids;

    event MetadataStored(
        string indexed cid,
        address indexed owner,
        string name,
        string domain,
        string license,
        string access
    );

    event MetadataUpdated(
        string indexed cid,
        address indexed updater,
        string name,
        string domain,
        string license,
        string access
    );

    function storeMetadata(
        string memory cid,
        string memory name,
        string memory domain,
        string memory license,
        string memory access
    ) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(
            bytes(_cidToMetadata[cid].cid).length == 0,
            "CID already exists"
        );

        _cidToMetadata[cid] = Metadata(cid, name, domain, license, access);
        _cidToOwner[cid] = msg.sender;
        _ownerToCids[msg.sender].push(cid);

        emit MetadataStored(cid, msg.sender, name, domain, license, access);
    }

    // Update existing metadata (only owner can update)
    function updateMetadata(
        string memory cid,
        string memory name,
        string memory domain,
        string memory license,
        string memory access
    ) external {
        require(_cidToOwner[cid] == msg.sender, "Only owner can update");
        require(bytes(cid).length > 0, "CID cannot be empty");

        _cidToMetadata[cid] = Metadata(cid, name, domain, license, access);

        emit MetadataUpdated(cid, msg.sender, name, domain, license, access);
    }

    // Get metadata by CID
    function getMetadataByCid(
        string memory cid
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address
        )
    {
        Metadata memory data = _cidToMetadata[cid];
        require(bytes(data.cid).length > 0, "Metadata not found");

        return (
            data.cid,
            data.name,
            data.domain,
            data.license,
            data.access,
            _cidToOwner[cid]
        );
    }

    // Get all CIDs owned by an address
    function getCidsByOwner(
        address owner
    ) external view returns (string[] memory) {
        return _ownerToCids[owner];
    }

    // Get owner of a CID
    function getOwnerOfCid(string memory cid) external view returns (address) {
        require(_cidToOwner[cid] != address(0), "CID not found");
        return _cidToOwner[cid];
    }

    // Helper function to check if CID exists
    function cidExists(string memory cid) external view returns (bool) {
        return bytes(_cidToMetadata[cid].cid).length > 0;
    }
}
