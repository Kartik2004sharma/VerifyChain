// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerificationRegistry
 * @dev Smart contract for recording and tracking product verifications
 * @notice Stores immutable verification records on blockchain
 */
contract VerificationRegistry is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct VerificationRecord {
        address verifier;           // Who verified the product
        uint256 timestamp;          // When verification occurred
        bool result;                // True = authentic, False = counterfeit
        uint8 confidenceScore;      // 0-100 confidence score
        string location;            // Optional: verification location
        bytes32 proofHash;         // Hash of verification proof data
        uint256 blockNumber;       // Block number of verification
    }
    
    struct VerificationStats {
        uint256 totalVerifications;
        uint256 authenticCount;
        uint256 counterfeitCount;
        uint256 lastVerificationTime;
        uint256 averageConfidenceScore;
    }
    
    // ============ State Variables ============
    
    // productId => array of verification records
    mapping(string => VerificationRecord[]) private verificationHistory;
    
    // productId => verification statistics
    mapping(string => VerificationStats) private productStats;
    
    // verifier address => count of verifications performed
    mapping(address => uint256) private verifierStats;
    
    // verifier address => array of verified product IDs
    mapping(address => string[]) private verifierProducts;
    
    // Track if a verifier has verified a specific product
    mapping(address => mapping(string => bool)) private hasVerified;
    
    // Global statistics
    uint256 private totalVerificationsGlobal;
    uint256 private totalAuthenticGlobal;
    uint256 private totalCounterfeitGlobal;
    
    // ============ Events ============
    
    event VerificationRecorded(
        string indexed productId,
        address indexed verifier,
        bool result,
        uint8 confidenceScore,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event CounterfeitReported(
        string indexed productId,
        address indexed reporter,
        uint256 timestamp
    );
    
    event VerificationChallenged(
        string indexed productId,
        address indexed challenger,
        string reason,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier validConfidenceScore(uint8 score) {
        require(score <= 100, "Confidence score must be 0-100");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Ready to use
    }
    
    // ============ Verification Functions ============
    
    /**
     * @dev Record a product verification
     * @param productId Product being verified
     * @param result Verification result (true = authentic)
     * @param confidenceScore Confidence score (0-100)
     * @param location Optional verification location
     * @param proofHash Hash of verification proof data
     */
    function recordVerification(
        string memory productId,
        bool result,
        uint8 confidenceScore,
        string memory location,
        bytes32 proofHash
    ) external nonReentrant validConfidenceScore(confidenceScore) {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(proofHash != bytes32(0), "Proof hash cannot be empty");
        
        // Create verification record
        VerificationRecord memory record = VerificationRecord({
            verifier: msg.sender,
            timestamp: block.timestamp,
            result: result,
            confidenceScore: confidenceScore,
            location: location,
            proofHash: proofHash,
            blockNumber: block.number
        });
        
        // Store record
        verificationHistory[productId].push(record);
        
        // Update statistics
        VerificationStats storage stats = productStats[productId];
        stats.totalVerifications++;
        if (result) {
            stats.authenticCount++;
        } else {
            stats.counterfeitCount++;
        }
        stats.lastVerificationTime = block.timestamp;
        
        // Update average confidence score
        uint256 totalScore = stats.averageConfidenceScore * (stats.totalVerifications - 1);
        stats.averageConfidenceScore = (totalScore + confidenceScore) / stats.totalVerifications;
        
        // Update verifier stats
        if (!hasVerified[msg.sender][productId]) {
            verifierProducts[msg.sender].push(productId);
            hasVerified[msg.sender][productId] = true;
        }
        verifierStats[msg.sender]++;
        
        // Update global stats
        totalVerificationsGlobal++;
        if (result) {
            totalAuthenticGlobal++;
        } else {
            totalCounterfeitGlobal++;
        }
        
        emit VerificationRecorded(
            productId,
            msg.sender,
            result,
            confidenceScore,
            block.timestamp,
            block.number
        );
        
        // Emit counterfeit alert if detected
        if (!result) {
            emit CounterfeitReported(productId, msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Batch record multiple verifications
     * @param productIds Array of product IDs
     * @param results Array of verification results
     * @param confidenceScores Array of confidence scores
     * @param proofHashes Array of proof hashes
     */
    function batchRecordVerifications(
        string[] memory productIds,
        bool[] memory results,
        uint8[] memory confidenceScores,
        bytes32[] memory proofHashes
    ) external nonReentrant {
        require(productIds.length > 0, "Empty arrays not allowed");
        require(
            productIds.length == results.length &&
            productIds.length == confidenceScores.length &&
            productIds.length == proofHashes.length,
            "Array lengths must match"
        );
        require(productIds.length <= 50, "Maximum 50 verifications per batch");
        
        for (uint256 i = 0; i < productIds.length; i++) {
            require(confidenceScores[i] <= 100, "Invalid confidence score");
            require(proofHashes[i] != bytes32(0), "Invalid proof hash");
            
            VerificationRecord memory record = VerificationRecord({
                verifier: msg.sender,
                timestamp: block.timestamp,
                result: results[i],
                confidenceScore: confidenceScores[i],
                location: "",
                proofHash: proofHashes[i],
                blockNumber: block.number
            });
            
            verificationHistory[productIds[i]].push(record);
            
            // Update stats (simplified for batch)
            VerificationStats storage stats = productStats[productIds[i]];
            stats.totalVerifications++;
            if (results[i]) {
                stats.authenticCount++;
                totalAuthenticGlobal++;
            } else {
                stats.counterfeitCount++;
                totalCounterfeitGlobal++;
                emit CounterfeitReported(productIds[i], msg.sender, block.timestamp);
            }
            stats.lastVerificationTime = block.timestamp;
            
            if (!hasVerified[msg.sender][productIds[i]]) {
                verifierProducts[msg.sender].push(productIds[i]);
                hasVerified[msg.sender][productIds[i]] = true;
            }
            
            emit VerificationRecorded(
                productIds[i],
                msg.sender,
                results[i],
                confidenceScores[i],
                block.timestamp,
                block.number
            );
        }
        
        verifierStats[msg.sender] += productIds.length;
        totalVerificationsGlobal += productIds.length;
    }
    
    /**
     * @dev Challenge a verification (dispute mechanism)
     * @param productId Product ID
     * @param verificationIndex Index of verification to challenge
     * @param reason Reason for challenge
     */
    function challengeVerification(
        string memory productId,
        uint256 verificationIndex,
        string memory reason
    ) external {
        require(verificationHistory[productId].length > verificationIndex, "Invalid verification index");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        require(bytes(reason).length <= 500, "Reason too long");
        
        emit VerificationChallenged(
            productId,
            msg.sender,
            reason,
            block.timestamp
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get verification count for a product
     * @param productId Product ID
     * @return Number of verifications
     */
    function getVerificationCount(string memory productId) external view returns (uint256) {
        return verificationHistory[productId].length;
    }
    
    /**
     * @dev Get complete verification history for a product
     * @param productId Product ID
     * @return Array of verification records
     */
    function getVerificationHistory(string memory productId) 
        external 
        view 
        returns (VerificationRecord[] memory) 
    {
        return verificationHistory[productId];
    }
    
    /**
     * @dev Get specific verification record
     * @param productId Product ID
     * @param index Index of verification
     * @return verifier Address that performed verification
     * @return timestamp When verification occurred
     * @return result Verification result (true = authentic)
     * @return confidenceScore Confidence score (0-100)
     * @return location Location of verification
     * @return proofHash Proof hash
     * @return blockNumber Block number
     */
    function getVerificationRecord(string memory productId, uint256 index) 
        external 
        view 
        returns (
            address verifier,
            uint256 timestamp,
            bool result,
            uint8 confidenceScore,
            string memory location,
            bytes32 proofHash,
            uint256 blockNumber
        ) 
    {
        require(verificationHistory[productId].length > index, "Invalid index");
        VerificationRecord memory record = verificationHistory[productId][index];
        return (
            record.verifier,
            record.timestamp,
            record.result,
            record.confidenceScore,
            record.location,
            record.proofHash,
            record.blockNumber
        );
    }
    
    /**
     * @dev Get verification statistics for a product
     * @param productId Product ID
     * @return totalVerifications Total number of verifications
     * @return authenticCount Number of authentic verifications
     * @return counterfeitCount Number of counterfeit detections
     * @return lastVerificationTime Last verification timestamp
     * @return averageConfidenceScore Average confidence score
     */
    function getProductStats(string memory productId) 
        external 
        view 
        returns (
            uint256 totalVerifications,
            uint256 authenticCount,
            uint256 counterfeitCount,
            uint256 lastVerificationTime,
            uint256 averageConfidenceScore
        ) 
    {
        VerificationStats memory stats = productStats[productId];
        return (
            stats.totalVerifications,
            stats.authenticCount,
            stats.counterfeitCount,
            stats.lastVerificationTime,
            stats.averageConfidenceScore
        );
    }
    
    /**
     * @dev Get success rate for a product
     * @param productId Product ID
     * @return Success rate as percentage (0-100)
     */
    function getSuccessRate(string memory productId) external view returns (uint256) {
        VerificationStats memory stats = productStats[productId];
        if (stats.totalVerifications == 0) {
            return 0;
        }
        return (stats.authenticCount * 100) / stats.totalVerifications;
    }
    
    /**
     * @dev Get verifier statistics
     * @param verifier Verifier address
     * @return Number of verifications performed
     */
    function getVerifierStats(address verifier) external view returns (uint256) {
        return verifierStats[verifier];
    }
    
    /**
     * @dev Get all products verified by an address
     * @param verifier Verifier address
     * @return Array of product IDs
     */
    function getVerifierProducts(address verifier) external view returns (string[] memory) {
        return verifierProducts[verifier];
    }
    
    /**
     * @dev Check if verifier has verified a specific product
     * @param verifier Verifier address
     * @param productId Product ID
     * @return True if verifier has verified the product
     */
    function hasVerifiedProduct(address verifier, string memory productId) 
        external 
        view 
        returns (bool) 
    {
        return hasVerified[verifier][productId];
    }
    
    /**
     * @dev Get global verification statistics
     * @return totalVerifications Total number of verifications
     * @return totalAuthentic Total authentic verifications
     * @return totalCounterfeit Total counterfeit detections
     * @return successRate Global success rate percentage
     */
    function getGlobalStats() 
        external 
        view 
        returns (
            uint256 totalVerifications,
            uint256 totalAuthentic,
            uint256 totalCounterfeit,
            uint256 successRate
        ) 
    {
        uint256 rate = totalVerificationsGlobal > 0 
            ? (totalAuthenticGlobal * 100) / totalVerificationsGlobal 
            : 0;
            
        return (
            totalVerificationsGlobal,
            totalAuthenticGlobal,
            totalCounterfeitGlobal,
            rate
        );
    }
    
    /**
     * @dev Get recent verifications (last N verifications for a product)
     * @param productId Product ID
     * @param count Number of recent verifications to retrieve
     * @return Array of recent verification records
     */
    function getRecentVerifications(string memory productId, uint256 count) 
        external 
        view 
        returns (VerificationRecord[] memory) 
    {
        uint256 total = verificationHistory[productId].length;
        if (total == 0) {
            return new VerificationRecord[](0);
        }
        
        uint256 start = total > count ? total - count : 0;
        uint256 resultCount = total - start;
        
        VerificationRecord[] memory recent = new VerificationRecord[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            recent[i] = verificationHistory[productId][start + i];
        }
        
        return recent;
    }
}
