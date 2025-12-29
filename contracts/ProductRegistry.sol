// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProductRegistry
 * @dev Smart contract for registering and managing product authenticity on blockchain
 * @notice This contract is part of a counterfeit detection system for academic research
 */
contract ProductRegistry is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    uint256 private _productCounter;
    
    struct Product {
        string productId;           // Unique product identifier
        string name;                // Product name
        address manufacturer;       // Manufacturer's wallet address
        uint256 registrationTime;   // Block timestamp of registration
        bytes32 dataHash;          // Hash of product metadata (IPFS CID or data hash)
        bool isVerified;           // Verification status
        bool exists;               // Flag to check if product exists
        string metadataURI;        // URI to detailed metadata (IPFS, etc.)
        uint256 blockNumber;       // Block number of registration
    }
    
    struct Manufacturer {
        string companyName;
        bool isRegistered;
        bool isActive;
        uint256 registrationTime;
        uint256 productCount;
        uint256 reputationScore;   // 0-100 score based on activity
    }
    
    // ============ Mappings ============
    
    mapping(string => Product) private products;                    // productId => Product
    mapping(address => Manufacturer) private manufacturers;         // address => Manufacturer
    mapping(address => string[]) private manufacturerProducts;      // address => productIds array
    mapping(bytes32 => bool) private usedHashes;                   // Prevent duplicate hashes
    mapping(address => mapping(string => bool)) private manufacturerProductExists; // Quick lookup
    
    // ============ Events ============
    
    event ProductRegistered(
        string indexed productId,
        address indexed manufacturer,
        bytes32 dataHash,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event ProductVerified(
        string indexed productId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event ProductUpdated(
        string indexed productId,
        bytes32 newDataHash,
        uint256 timestamp
    );
    
    event ManufacturerRegistered(
        address indexed manufacturer,
        string companyName,
        uint256 timestamp
    );
    
    event ManufacturerStatusChanged(
        address indexed manufacturer,
        bool isActive,
        uint256 timestamp
    );
    
    event ProductRevoked(
        string indexed productId,
        address indexed manufacturer,
        string reason,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyManufacturer() {
        require(manufacturers[msg.sender].isRegistered, "Not a registered manufacturer");
        require(manufacturers[msg.sender].isActive, "Manufacturer account is not active");
        _;
    }
    
    modifier productExists(string memory productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }
    
    modifier productNotExists(string memory productId) {
        require(!products[productId].exists, "Product already exists");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Contract is ready to use immediately
    }
    
    // ============ Manufacturer Management Functions ============
    
    /**
     * @dev Register a new manufacturer
     * @param companyName Name of the manufacturing company
     */
    function registerManufacturer(string memory companyName) external {
        require(!manufacturers[msg.sender].isRegistered, "Manufacturer already registered");
        require(bytes(companyName).length > 0, "Company name cannot be empty");
        require(bytes(companyName).length <= 100, "Company name too long");
        
        manufacturers[msg.sender] = Manufacturer({
            companyName: companyName,
            isRegistered: true,
            isActive: true,
            registrationTime: block.timestamp,
            productCount: 0,
            reputationScore: 50  // Start with neutral reputation
        });
        
        emit ManufacturerRegistered(msg.sender, companyName, block.timestamp);
    }
    
    /**
     * @dev Deactivate a manufacturer (only owner)
     * @param manufacturer Address of the manufacturer to deactivate
     */
    function deactivateManufacturer(address manufacturer) external onlyOwner {
        require(manufacturers[manufacturer].isRegistered, "Manufacturer not registered");
        manufacturers[manufacturer].isActive = false;
        
        emit ManufacturerStatusChanged(manufacturer, false, block.timestamp);
    }
    
    /**
     * @dev Activate a manufacturer (only owner)
     * @param manufacturer Address of the manufacturer to activate
     */
    function activateManufacturer(address manufacturer) external onlyOwner {
        require(manufacturers[manufacturer].isRegistered, "Manufacturer not registered");
        manufacturers[manufacturer].isActive = true;
        
        emit ManufacturerStatusChanged(manufacturer, true, block.timestamp);
    }
    
    /**
     * @dev Update manufacturer reputation score (only owner)
     * @param manufacturer Address of the manufacturer
     * @param newScore New reputation score (0-100)
     */
    function updateManufacturerReputation(address manufacturer, uint256 newScore) external onlyOwner {
        require(manufacturers[manufacturer].isRegistered, "Manufacturer not registered");
        require(newScore <= 100, "Score must be between 0 and 100");
        
        manufacturers[manufacturer].reputationScore = newScore;
    }
    
    // ============ Product Registration Functions ============
    
    /**
     * @dev Register a new product on the blockchain
     * @param productId Unique identifier for the product
     * @param name Product name
     * @param dataHash Hash of product metadata (IPFS CID or SHA-256)
     * @param metadataURI URI to full product metadata
     */
    function registerProduct(
        string memory productId,
        string memory name,
        bytes32 dataHash,
        string memory metadataURI
    ) external productNotExists(productId) nonReentrant {
        // Auto-register manufacturer if not already registered
        if (!manufacturers[msg.sender].isRegistered) {
            manufacturers[msg.sender] = Manufacturer({
                companyName: _addressToString(msg.sender),
                isRegistered: true,
                isActive: true,
                registrationTime: block.timestamp,
                productCount: 0,
                reputationScore: 50
            });
            emit ManufacturerRegistered(msg.sender, manufacturers[msg.sender].companyName, block.timestamp);
        }
        
        // Ensure manufacturer is active
        require(manufacturers[msg.sender].isActive, "Manufacturer account is not active");
        
        // Validation
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(bytes(productId).length <= 100, "Product ID too long");
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(bytes(name).length <= 200, "Product name too long");
        require(dataHash != bytes32(0), "Data hash cannot be empty");
        require(!usedHashes[dataHash], "Data hash already used");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        
        // Create product
        products[productId] = Product({
            productId: productId,
            name: name,
            manufacturer: msg.sender,
            registrationTime: block.timestamp,
            dataHash: dataHash,
            isVerified: true,  // Automatically verified upon registration
            exists: true,
            metadataURI: metadataURI,
            blockNumber: block.number
        });
        
        // Update mappings
        usedHashes[dataHash] = true;
        manufacturerProducts[msg.sender].push(productId);
        manufacturerProductExists[msg.sender][productId] = true;
        
        // Update manufacturer stats
        manufacturers[msg.sender].productCount++;
        _productCounter++;
        
        // Update reputation (small increase for each product registered)
        if (manufacturers[msg.sender].reputationScore < 100) {
            manufacturers[msg.sender].reputationScore += 1;
        }
        
        emit ProductRegistered(
            productId,
            msg.sender,
            dataHash,
            block.timestamp,
            block.number
        );
    }
    
    /**
     * @dev Batch register multiple products (gas efficient)
     * @param productIds Array of product IDs
     * @param names Array of product names
     * @param dataHashes Array of data hashes
     * @param metadataURIs Array of metadata URIs
     */
    function batchRegisterProducts(
        string[] memory productIds,
        string[] memory names,
        bytes32[] memory dataHashes,
        string[] memory metadataURIs
    ) external onlyManufacturer nonReentrant {
        require(productIds.length > 0, "Empty arrays not allowed");
        require(
            productIds.length == names.length &&
            productIds.length == dataHashes.length &&
            productIds.length == metadataURIs.length,
            "Array lengths must match"
        );
        require(productIds.length <= 50, "Maximum 50 products per batch");
        
        for (uint256 i = 0; i < productIds.length; i++) {
            require(!products[productIds[i]].exists, "Product already exists");
            require(dataHashes[i] != bytes32(0), "Data hash cannot be empty");
            require(!usedHashes[dataHashes[i]], "Data hash already used");
            
            products[productIds[i]] = Product({
                productId: productIds[i],
                name: names[i],
                manufacturer: msg.sender,
                registrationTime: block.timestamp,
                dataHash: dataHashes[i],
                isVerified: true,
                exists: true,
                metadataURI: metadataURIs[i],
                blockNumber: block.number
            });
            
            usedHashes[dataHashes[i]] = true;
            manufacturerProducts[msg.sender].push(productIds[i]);
            manufacturerProductExists[msg.sender][productIds[i]] = true;
            
            emit ProductRegistered(
                productIds[i],
                msg.sender,
                dataHashes[i],
                block.timestamp,
                block.number
            );
        }
        
        manufacturers[msg.sender].productCount += productIds.length;
        
        // Update reputation based on batch size
        uint256 reputationIncrease = productIds.length / 10; // 1 point per 10 products
        if (manufacturers[msg.sender].reputationScore + reputationIncrease <= 100) {
            manufacturers[msg.sender].reputationScore += reputationIncrease;
        }
    }
    
    /**
     * @dev Update product metadata URI
     * @param productId Product to update
     * @param newMetadataURI New metadata URI
     */
    function updateProductMetadata(
        string memory productId,
        string memory newMetadataURI
    ) external onlyManufacturer productExists(productId) {
        require(
            products[productId].manufacturer == msg.sender,
            "Only product manufacturer can update"
        );
        require(bytes(newMetadataURI).length > 0, "Metadata URI cannot be empty");
        
        products[productId].metadataURI = newMetadataURI;
        
        emit ProductUpdated(
            productId,
            products[productId].dataHash,
            block.timestamp
        );
    }
    
    /**
     * @dev Revoke a product (mark as invalid)
     * @param productId Product to revoke
     * @param reason Reason for revocation
     */
    function revokeProduct(
        string memory productId,
        string memory reason
    ) external productExists(productId) {
        require(
            products[productId].manufacturer == msg.sender || msg.sender == owner(),
            "Only manufacturer or owner can revoke"
        );
        
        products[productId].isVerified = false;
        
        emit ProductRevoked(productId, msg.sender, reason, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Check if a product is registered
     * @param productId Product ID to check
     * @return bool True if product exists
     */
    function isProductRegistered(string memory productId) external view returns (bool) {
        return products[productId].exists;
    }
    
    /**
     * @dev Get product details
     * @param productId Product ID to query
     * @return name Product name
     * @return manufacturer Manufacturer address
     * @return timestamp Registration timestamp
     * @return dataHash Product data hash
     * @return isVerified Verification status
     * @return metadataURI Metadata URI
     */
    function getProduct(string memory productId) 
        external 
        view 
        productExists(productId) 
        returns (
            string memory name,
            address manufacturer,
            uint256 timestamp,
            bytes32 dataHash,
            bool isVerified,
            string memory metadataURI
        ) 
    {
        Product memory product = products[productId];
        return (
            product.name,
            product.manufacturer,
            product.registrationTime,
            product.dataHash,
            product.isVerified,
            product.metadataURI
        );
    }
    
    /**
     * @dev Get product block number
     * @param productId Product ID
     * @return Block number when product was registered
     */
    function getProductBlockNumber(string memory productId) 
        external 
        view 
        productExists(productId) 
        returns (uint256) 
    {
        return products[productId].blockNumber;
    }
    
    /**
     * @dev Get manufacturer details
     * @param manufacturer Manufacturer address
     * @return companyName Company name
     * @return isRegistered Registration status
     * @return isActive Active status
     * @return registrationTime Registration timestamp
     * @return productCount Number of products
     * @return reputationScore Reputation score
     */
    function getManufacturer(address manufacturer) 
        external 
        view 
        returns (
            string memory companyName,
            bool isRegistered,
            bool isActive,
            uint256 registrationTime,
            uint256 productCount,
            uint256 reputationScore
        ) 
    {
        Manufacturer memory mfr = manufacturers[manufacturer];
        return (
            mfr.companyName,
            mfr.isRegistered,
            mfr.isActive,
            mfr.registrationTime,
            mfr.productCount,
            mfr.reputationScore
        );
    }
    
    /**
     * @dev Get manufacturer's product count
     * @param manufacturer Manufacturer address
     * @return Number of products registered by manufacturer
     */
    function getManufacturerProductCount(address manufacturer) external view returns (uint256) {
        return manufacturers[manufacturer].productCount;
    }
    
    /**
     * @dev Get all product IDs registered by a manufacturer
     * @param manufacturer Manufacturer address
     * @return Array of product IDs
     */
    function getManufacturerProducts(address manufacturer) external view returns (string[] memory) {
        return manufacturerProducts[manufacturer];
    }
    
    /**
     * @dev Get total number of registered products
     * @return Total product count
     */
    function getTotalProductCount() external view returns (uint256) {
        return _productCounter;
    }
    
    /**
     * @dev Check if manufacturer owns a specific product
     * @param manufacturer Manufacturer address
     * @param productId Product ID
     * @return True if manufacturer owns the product
     */
    function isManufacturerProduct(address manufacturer, string memory productId) 
        external 
        view 
        returns (bool) 
    {
        return manufacturerProductExists[manufacturer][productId];
    }
    
    /**
     * @dev Verify product authenticity (external verification)
     * @param productId Product to verify
     * @return isAuthentic True if product is authentic
     * @return manufacturer Manufacturer address
     * @return dataHash Product data hash
     */
    function verifyProductAuthenticity(string memory productId) 
        external 
        view 
        returns (
            bool isAuthentic,
            address manufacturer,
            bytes32 dataHash
        ) 
    {
        if (!products[productId].exists) {
            return (false, address(0), bytes32(0));
        }
        
        Product memory product = products[productId];
        return (
            product.isVerified,
            product.manufacturer,
            product.dataHash
        );
    }
    
    /**
     * @dev Convert address to string
     * @param addr Address to convert
     * @return String representation of address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory data = abi.encodePacked(addr);
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
