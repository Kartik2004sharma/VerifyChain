// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SupplyChainTracker is Ownable, ReentrancyGuard {
    
    struct SupplyChainStep {
        uint256 stepNumber;
        string location;
        address handler;
        uint256 timestamp;
        bytes32 proofHash;
        bool verified;
        string action;
        string notes;
        uint256 blockNumber;
        bytes32 previousStepHash;
    }
    
    struct SupplyChainInfo {
        bool exists;
        uint256 totalSteps;
        uint256 lastUpdateTime;
        address creator;
        bool isComplete;
        uint256 startTime;
        uint256 endTime;
    }
    
    mapping(string => SupplyChainStep[]) private supplyChains;
    mapping(string => SupplyChainInfo) private supplyChainInfo;
    mapping(address => string[]) private handlerProducts;
    mapping(address => bool) private authorizedHandlers;
    mapping(string => mapping(address => bool)) private hasHandled;
    mapping(address => uint256) private handlerReputation;
    mapping(address => uint256) private handlerStepCount;
    
    string[] public validActions;
    mapping(string => bool) private isValidAction;
    
    event SupplyChainStepAdded(string indexed productId, uint256 stepNumber, address indexed handler, string location, string action, uint256 timestamp, bytes32 proofHash);
    event SupplyChainCompleted(string indexed productId, uint256 totalSteps, uint256 totalDuration, uint256 timestamp);
    event StepVerified(string indexed productId, uint256 stepNumber, address indexed verifier, uint256 timestamp);
    event HandlerAuthorized(address indexed handler, uint256 timestamp);
    event HandlerRevoked(address indexed handler, uint256 timestamp);
    event SupplyChainAnomalyDetected(string indexed productId, uint256 stepNumber, string anomalyType, uint256 timestamp);
    
    modifier onlyAuthorizedHandler() {
        require(authorizedHandlers[msg.sender] || msg.sender == owner(), "Not authorized handler");
        _;
    }
    
    modifier supplyChainExists(string memory productId) {
        require(supplyChainInfo[productId].exists, "Supply chain does not exist");
        _;
    }
    
    modifier validActionType(string memory action) {
        require(isValidAction[action] || bytes(action).length == 0, "Invalid action type");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        validActions = ["manufactured", "quality_checked", "packaged", "shipped", "in_transit", "customs_cleared", "received_at_warehouse", "quality_inspected", "received_by_distributor", "received_by_retailer", "displayed", "sold", "delivered"];
        for (uint256 i = 0; i < validActions.length; i++) {
            isValidAction[validActions[i]] = true;
        }
    }
    
    function authorizeHandler(address handler) external onlyOwner {
        require(handler != address(0), "Invalid handler address");
        require(!authorizedHandlers[handler], "Handler already authorized");
        authorizedHandlers[handler] = true;
        handlerReputation[handler] = 50;
        emit HandlerAuthorized(handler, block.timestamp);
    }
    
    function revokeHandler(address handler) external onlyOwner {
        require(authorizedHandlers[handler], "Handler not authorized");
        authorizedHandlers[handler] = false;
        emit HandlerRevoked(handler, block.timestamp);
    }
    
    function batchAuthorizeHandlers(address[] memory handlers) external onlyOwner {
        require(handlers.length > 0, "Empty array");
        require(handlers.length <= 50, "Maximum 50 handlers per batch");
        for (uint256 i = 0; i < handlers.length; i++) {
            require(handlers[i] != address(0), "Invalid handler address");
            if (!authorizedHandlers[handlers[i]]) {
                authorizedHandlers[handlers[i]] = true;
                handlerReputation[handlers[i]] = 50;
                emit HandlerAuthorized(handlers[i], block.timestamp);
            }
        }
    }
    
    function updateHandlerReputation(address handler, uint256 newReputation) external onlyOwner {
        require(newReputation <= 100, "Reputation must be 0-100");
        handlerReputation[handler] = newReputation;
    }
    
    function initializeSupplyChain(string memory productId, string memory location, string memory action, bytes32 proofHash, string memory notes) external onlyAuthorizedHandler validActionType(action) nonReentrant {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(!supplyChainInfo[productId].exists, "Supply chain already exists");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(proofHash != bytes32(0), "Proof hash cannot be empty");
        
        SupplyChainStep memory firstStep = SupplyChainStep({
            stepNumber: 1,
            location: location,
            handler: msg.sender,
            timestamp: block.timestamp,
            proofHash: proofHash,
            verified: true,
            action: action,
            notes: notes,
            blockNumber: block.number,
            previousStepHash: bytes32(0)
        });
        
        supplyChains[productId].push(firstStep);
        
        supplyChainInfo[productId] = SupplyChainInfo({
            exists: true,
            totalSteps: 1,
            lastUpdateTime: block.timestamp,
            creator: msg.sender,
            isComplete: false,
            startTime: block.timestamp,
            endTime: 0
        });
        
        if (!hasHandled[productId][msg.sender]) {
            handlerProducts[msg.sender].push(productId);
            hasHandled[productId][msg.sender] = true;
        }
        handlerStepCount[msg.sender]++;
        
        emit SupplyChainStepAdded(productId, 1, msg.sender, location, action, block.timestamp, proofHash);
    }
    
    function addSupplyChainStep(string memory productId, string memory location, string memory action, bytes32 proofHash, string memory notes) external onlyAuthorizedHandler supplyChainExists(productId) validActionType(action) nonReentrant {
        require(!supplyChainInfo[productId].isComplete, "Supply chain already completed");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(proofHash != bytes32(0), "Proof hash cannot be empty");
        
        SupplyChainInfo storage info = supplyChainInfo[productId];
        SupplyChainStep[] storage steps = supplyChains[productId];
        
        bytes32 prevStepHash = keccak256(abi.encodePacked(steps[steps.length - 1].location, steps[steps.length - 1].handler, steps[steps.length - 1].timestamp, steps[steps.length - 1].proofHash));
        
        require(block.timestamp >= steps[steps.length - 1].timestamp, "Timestamp cannot be before previous step");
        
        uint256 timeDiff = block.timestamp - steps[steps.length - 1].timestamp;
        if (timeDiff > 90 days) {
            emit SupplyChainAnomalyDetected(productId, info.totalSteps + 1, "suspicious_time_gap", block.timestamp);
        }
        
        SupplyChainStep memory newStep = SupplyChainStep({
            stepNumber: info.totalSteps + 1,
            location: location,
            handler: msg.sender,
            timestamp: block.timestamp,
            proofHash: proofHash,
            verified: false,
            action: action,
            notes: notes,
            blockNumber: block.number,
            previousStepHash: prevStepHash
        });
        
        steps.push(newStep);
        info.totalSteps++;
        info.lastUpdateTime = block.timestamp;
        
        if (!hasHandled[productId][msg.sender]) {
            handlerProducts[msg.sender].push(productId);
            hasHandled[productId][msg.sender] = true;
        }
        handlerStepCount[msg.sender]++;
        
        if (handlerReputation[msg.sender] >= 80) {
            steps[steps.length - 1].verified = true;
        }
        
        emit SupplyChainStepAdded(productId, newStep.stepNumber, msg.sender, location, action, block.timestamp, proofHash);
    }
    
    function verifyStep(string memory productId, uint256 stepNumber) external onlyAuthorizedHandler supplyChainExists(productId) {
        require(stepNumber > 0 && stepNumber <= supplyChains[productId].length, "Invalid step number");
        SupplyChainStep storage step = supplyChains[productId][stepNumber - 1];
        require(!step.verified, "Step already verified");
        step.verified = true;
        emit StepVerified(productId, stepNumber, msg.sender, block.timestamp);
    }
    
    function completeSupplyChain(string memory productId) external onlyAuthorizedHandler supplyChainExists(productId) {
        SupplyChainInfo storage info = supplyChainInfo[productId];
        require(!info.isComplete, "Supply chain already completed");
        require(info.totalSteps >= 2, "Supply chain must have at least 2 steps");
        info.isComplete = true;
        info.endTime = block.timestamp;
        uint256 totalDuration = info.endTime - info.startTime;
        emit SupplyChainCompleted(productId, info.totalSteps, totalDuration, block.timestamp);
    }
    
    function updateStepNotes(string memory productId, uint256 stepNumber, string memory newNotes) external supplyChainExists(productId) {
        require(stepNumber > 0 && stepNumber <= supplyChains[productId].length, "Invalid step number");
        SupplyChainStep storage step = supplyChains[productId][stepNumber - 1];
        require(step.handler == msg.sender || msg.sender == owner(), "Only handler or owner can update");
        require(bytes(newNotes).length <= 500, "Notes too long");
        step.notes = newNotes;
    }
    
    function getSupplyChainSteps(string memory productId) external view supplyChainExists(productId) returns (uint256) {
        return supplyChains[productId].length;
    }
    
    function getSupplyChainStep(string memory productId, uint256 stepIndex) external view supplyChainExists(productId) returns (uint256 stepNumber, string memory location, address handler, uint256 timestamp, bytes32 proofHash, bool verified, string memory action, string memory notes, uint256 blockNumber) {
        require(stepIndex < supplyChains[productId].length, "Invalid step index");
        SupplyChainStep memory step = supplyChains[productId][stepIndex];
        return (step.stepNumber, step.location, step.handler, step.timestamp, step.proofHash, step.verified, step.action, step.notes, step.blockNumber);
    }
    
    function getCompleteSupplyChain(string memory productId) external view supplyChainExists(productId) returns (SupplyChainStep[] memory) {
        return supplyChains[productId];
    }
    
    function getSupplyChainInfo(string memory productId) external view supplyChainExists(productId) returns (bool exists, uint256 totalSteps, uint256 lastUpdateTime, address creator, bool isComplete, uint256 startTime, uint256 endTime, uint256 duration) {
        SupplyChainInfo memory info = supplyChainInfo[productId];
        uint256 dur = info.isComplete ? info.endTime - info.startTime : block.timestamp - info.startTime;
        return (info.exists, info.totalSteps, info.lastUpdateTime, info.creator, info.isComplete, info.startTime, info.endTime, dur);
    }
    
    function isHandlerAuthorized(address handler) external view returns (bool) {
        return authorizedHandlers[handler];
    }
    
    function getHandlerReputation(address handler) external view returns (uint256) {
        return handlerReputation[handler];
    }
    
    function getHandlerStats(address handler) external view returns (uint256 stepCount, uint256 productCount, uint256 reputation) {
        return (handlerStepCount[handler], handlerProducts[handler].length, handlerReputation[handler]);
    }
    
    function getHandlerProducts(address handler) external view returns (string[] memory) {
        return handlerProducts[handler];
    }
    
    function verifySupplyChainIntegrity(string memory productId) external view supplyChainExists(productId) returns (bool isValid, uint256 invalidStepNumber) {
        SupplyChainStep[] memory steps = supplyChains[productId];
        for (uint256 i = 1; i < steps.length; i++) {
            if (steps[i].timestamp < steps[i-1].timestamp) {
                return (false, i + 1);
            }
            bytes32 expectedHash = keccak256(abi.encodePacked(steps[i-1].location, steps[i-1].handler, steps[i-1].timestamp, steps[i-1].proofHash));
            if (steps[i].previousStepHash != expectedHash) {
                return (false, i + 1);
            }
        }
        return (true, 0);
    }
    
    function getUnverifiedStepsCount(string memory productId) external view supplyChainExists(productId) returns (uint256) {
        uint256 count = 0;
        SupplyChainStep[] memory steps = supplyChains[productId];
        for (uint256 i = 0; i < steps.length; i++) {
            if (!steps[i].verified) {
                count++;
            }
        }
        return count;
    }
    
    function getAverageStepDuration(string memory productId) external view supplyChainExists(productId) returns (uint256) {
        SupplyChainStep[] memory steps = supplyChains[productId];
        if (steps.length < 2) {
            return 0;
        }
        uint256 totalDuration = 0;
        for (uint256 i = 1; i < steps.length; i++) {
            totalDuration += steps[i].timestamp - steps[i-1].timestamp;
        }
        return totalDuration / (steps.length - 1);
    }
    
    function getValidActions() external view returns (string[] memory) {
        return validActions;
    }
    
    function supplyChainExistsFor(string memory productId) external view returns (bool) {
        return supplyChainInfo[productId].exists;
    }
}
