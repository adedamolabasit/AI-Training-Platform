// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataSet {
    struct Metadata {
        string cid;
        string name;
        string fileName;
        uint256 fileSize;
        string domain;
        string license;
        string access;
        string visibility;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(string => Metadata) private _cidToMetadata;
    mapping(string => address) private _cidToOwner;
    mapping(address => string[]) private _ownerToCids;
    string[] private _allCids;

    event MetadataStored(
        string indexed cid,
        address indexed owner,
        string name,
        string fileName,
        uint256 fileSize,
        string domain,
        string license,
        string access,
        string visibility
    );

    event MetadataUpdated(
        string indexed cid,
        address indexed updater,
        string name,
        string fileName,
        uint256 fileSize,
        string domain,
        string license,
        string access,
        string visibility
    );

    function storeMetadata(
        string memory cid,
        string memory name,
        string memory fileName,
        uint256 fileSize,
        string memory domain,
        string memory license,
        string memory access,
        string memory visibility
    ) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(bytes(_cidToMetadata[cid].cid).length == 0, "CID already exists");
        require(fileSize > 0, "File size must be greater than 0");
        require(
            _compareStrings(visibility, "public") ||
            _compareStrings(visibility, "private") ||
            _compareStrings(visibility, "restricted"),
            "Invalid visibility setting"
        );

        _cidToMetadata[cid] = Metadata({
            cid: cid,
            name: name,
            fileName: fileName,
            fileSize: fileSize,
            domain: domain,
            license: license,
            access: access,
            visibility: visibility,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _cidToOwner[cid] = msg.sender;
        _ownerToCids[msg.sender].push(cid);
        _allCids.push(cid);

        emit MetadataStored(
            cid,
            msg.sender,
            name,
            fileName,
            fileSize,
            domain,
            license,
            access,
            visibility
        );
    }

    // Get all metadata with pagination
    function getAllMetadata(uint256 page, uint256 pageSize) 
        external 
        view 
        returns (Metadata[] memory) 
    {
        require(pageSize > 0 && pageSize <= 100, "Invalid page size");
        
        uint256 start = page * pageSize;
        if (start >= _allCids.length) {
            return new Metadata[](0);
        }
        
        uint256 end = start + pageSize;
        if (end > _allCids.length) {
            end = _allCids.length;
        }
        
        Metadata[] memory result = new Metadata[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = _cidToMetadata[_allCids[i]];
        }
        
        return result;
    }

    // Get filtered metadata by visibility
    function getMetadataByVisibility(
        string memory visibility, 
        uint256 page, 
        uint256 pageSize
    ) external view returns (Metadata[] memory) {
        require(pageSize > 0 && pageSize <= 100, "Invalid page size");
        require(
            _compareStrings(visibility, "public") ||
            _compareStrings(visibility, "private") ||
            _compareStrings(visibility, "restricted"),
            "Invalid visibility setting"
        );
        
        // First count how many match
        uint256 count = 0;
        for (uint256 i = 0; i < _allCids.length; i++) {
            if (_compareStrings(_cidToMetadata[_allCids[i]].visibility, visibility)) {
                count++;
            }
        }
        
        // Then collect the paginated results
        uint256 start = page * pageSize;
        if (start >= count) {
            return new Metadata[](0);
        }
        
        uint256 end = start + pageSize;
        if (end > count) {
            end = count;
        }
        
        Metadata[] memory result = new Metadata[](end - start);
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < _allCids.length && resultIndex < result.length; i++) {
            if (_compareStrings(_cidToMetadata[_allCids[i]].visibility, visibility)) {
                if (currentIndex >= start && currentIndex < end) {
                    result[resultIndex] = _cidToMetadata[_allCids[i]];
                    resultIndex++;
                }
                currentIndex++;
            }
        }
        
        return result;
    }

    // Get total count of all datasets
    function getTotalDatasetCount() external view returns (uint256) {
        return _allCids.length;
    }

    // Get count by visibility
    function getCountByVisibility(string memory visibility) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _allCids.length; i++) {
            if (_compareStrings(_cidToMetadata[_allCids[i]].visibility, visibility)) {
                count++;
            }
        }
        return count;
    }

    // Helper function to compare strings
    function _compareStrings(string memory a, string memory b) 
        private 
        pure 
        returns (bool) 
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // ... (keep all other existing functions from previous version) ...
}