// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CounterfeitReporter is Ownable, ReentrancyGuard {
    
    enum ReportStatus { Pending, UnderReview, Validated, Rejected, Resolved }
    
    struct CounterfeitReport {
        uint256 reportId;
        string productId;
        address reporter;
        uint256 timestamp;
        string reason;
        string evidence;
        uint256 stake;
        ReportStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votingDeadline;
        bool resolved;
        bool isCounterfeit;
        uint256 rewardClaimed;
    }
    
    struct Vote {
        address voter;
        bool votedFor;
        uint256 timestamp;
        uint256 stake;
    }
    
    uint256 private reportCounter;
    uint256 public minimumStake = 0.01 ether;
    uint256 public votingPeriod = 7 days;
    uint256 public minimumVotes = 5;
    
    mapping(uint256 => CounterfeitReport) private reports;
    mapping(string => uint256[]) private productReports;
    mapping(uint256 => Vote[]) private reportVotes;
    mapping(uint256 => mapping(address => Vote)) private voterRecords;
    mapping(uint256 => mapping(address => bool)) private hasVoted;
    mapping(address => uint256[]) private reporterReports;
    mapping(address => uint256) private reporterAccuracy;
    mapping(address => uint256) private totalReports;
    mapping(address => uint256) private accurateReports;
    
    uint256 public rewardPool; // Only voluntary funding, never participant escrow.
    uint256 public outstandingStakes;
    mapping(uint256 => mapping(address => bool)) public claimed;
    mapping(uint256 => bool) public cancelled;
    
    event CounterfeitReported(uint256 indexed reportId, string indexed productId, address indexed reporter, uint256 stake, uint256 timestamp);
    event ReportVoted(uint256 indexed reportId, address indexed voter, bool votedFor, uint256 stake, uint256 timestamp);
    event ReportResolved(uint256 indexed reportId, string indexed productId, bool isCounterfeit, uint256 timestamp);
    event RewardClaimed(uint256 indexed reportId, address indexed recipient, uint256 amount, uint256 timestamp);
    event StakeReturned(uint256 indexed reportId, address indexed recipient, uint256 amount, uint256 timestamp);
    
    modifier reportExists(uint256 reportId) {
        require(reportId > 0 && reportId <= reportCounter, "Report does not exist");
        _;
    }
    
    modifier notResolved(uint256 reportId) {
        require(!reports[reportId].resolved, "Report already resolved");
        _;
    }
    
    modifier votingOpen(uint256 reportId) {
        require(block.timestamp <= reports[reportId].votingDeadline, "Voting period ended");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        reportCounter = 0;
    }
    
    function reportCounterfeit(string memory productId, string memory reason, string memory evidence) external payable nonReentrant {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        require(bytes(reason).length <= 500, "Reason too long");
        require(msg.value >= minimumStake, "Insufficient stake");
        
        outstandingStakes += msg.value;
        reportCounter++;
        
        reports[reportCounter] = CounterfeitReport({
            reportId: reportCounter,
            productId: productId,
            reporter: msg.sender,
            timestamp: block.timestamp,
            reason: reason,
            evidence: evidence,
            stake: msg.value,
            status: ReportStatus.Pending,
            votesFor: 0,
            votesAgainst: 0,
            votingDeadline: block.timestamp + votingPeriod,
            resolved: false,
            isCounterfeit: false,
            rewardClaimed: 0
        });
        
        productReports[productId].push(reportCounter);
        reporterReports[msg.sender].push(reportCounter);
        totalReports[msg.sender]++;
        
        emit CounterfeitReported(reportCounter, productId, msg.sender, msg.value, block.timestamp);
    }
    
    function voteOnReport(uint256 reportId, bool voteFor) external payable reportExists(reportId) notResolved(reportId) votingOpen(reportId) nonReentrant {
        require(!hasVoted[reportId][msg.sender], "Already voted on this report");
        require(msg.value >= minimumStake / 2, "Insufficient voting stake");
        require(msg.sender != reports[reportId].reporter, "Reporter cannot vote on own report");
        
        outstandingStakes += msg.value;
        Vote memory newVote = Vote({
            voter: msg.sender,
            votedFor: voteFor,
            timestamp: block.timestamp,
            stake: msg.value
        });
        
        reportVotes[reportId].push(newVote);
        voterRecords[reportId][msg.sender] = newVote;
        hasVoted[reportId][msg.sender] = true;
        
        if (voteFor) {
            reports[reportId].votesFor++;
        } else {
            reports[reportId].votesAgainst++;
        }
        
        if (reports[reportId].votesFor + reports[reportId].votesAgainst >= minimumVotes) {
            reports[reportId].status = ReportStatus.UnderReview;
        }
        
        emit ReportVoted(reportId, msg.sender, voteFor, msg.value, block.timestamp);
        
        uint256 totalVotes = reports[reportId].votesFor + reports[reportId].votesAgainst;
        if (totalVotes >= minimumVotes) {
            uint256 forPercentage = (reports[reportId].votesFor * 100) / totalVotes;
            if (forPercentage >= 80) {
                _resolveReport(reportId, true);
            } else if (forPercentage <= 20) {
                _resolveReport(reportId, false);
            }
        }
    }
    
    function resolveReport(uint256 reportId) external reportExists(reportId) notResolved(reportId) {
        require(block.timestamp > reports[reportId].votingDeadline, "Voting period not ended");
        require(reports[reportId].votesFor + reports[reportId].votesAgainst >= minimumVotes, "Insufficient votes");
        bool isCounterfeit = reports[reportId].votesFor > reports[reportId].votesAgainst;
        _resolveReport(reportId, isCounterfeit);
    }
    
    function _resolveReport(uint256 reportId, bool isCounterfeit) private {
        CounterfeitReport storage report = reports[reportId];
        require(!report.resolved, "Already resolved");
        
        report.resolved = true;
        report.isCounterfeit = isCounterfeit;
        report.status = ReportStatus.Resolved;
        
        if (isCounterfeit) {
            accurateReports[report.reporter]++;
        }
        reporterAccuracy[report.reporter] = (accurateReports[report.reporter] * 100) / totalReports[report.reporter];
        
        emit ReportResolved(reportId, report.productId, isCounterfeit, block.timestamp);
    }
    
    // Source v2 deliberately returns principal only. No authenticity bounty promises.
    function claimReward(uint256 reportId) external reportExists(reportId) nonReentrant {
        require(reports[reportId].resolved, "Report not resolved yet");
        require(!claimed[reportId][msg.sender], "Already claimed");
        if (!cancelled[reportId]) {
            if (msg.sender != reports[reportId].reporter) {
                require(hasVoted[reportId][msg.sender] && voterRecords[reportId][msg.sender].votedFor == reports[reportId].isCounterfeit, "Use incorrect vote refund");
            }
        }
        _refund(reportId);
    }

    function returnIncorrectVoteStake(uint256 reportId) external reportExists(reportId) nonReentrant {
        require(reports[reportId].resolved, "Report not resolved yet");
        require(hasVoted[reportId][msg.sender], "Did not vote on this report");
        bool incorrect = voterRecords[reportId][msg.sender].votedFor != reports[reportId].isCounterfeit;
        require(incorrect || cancelled[reportId], "Use correct vote claim");
        _refund(reportId);
    }

    function _refund(uint256 reportId) private {
        require(!claimed[reportId][msg.sender], "Already claimed");
        uint256 amount;
        if (msg.sender == reports[reportId].reporter) {
            amount = reports[reportId].stake;
            reports[reportId].stake = 0;
        } else {
            Vote storage vote = voterRecords[reportId][msg.sender];
            amount = vote.stake;
            vote.stake = 0;
        }
        require(amount > 0, "No stake to claim");
        claimed[reportId][msg.sender] = true;
        outstandingStakes -= amount;
        reports[reportId].rewardClaimed += amount;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit StakeReturned(reportId, msg.sender, amount, block.timestamp);
    }

    function cancelReport(uint256 reportId) external reportExists(reportId) notResolved(reportId) nonReentrant {
        require(msg.sender == reports[reportId].reporter, "Only reporter can cancel");
        require(reports[reportId].votesFor + reports[reportId].votesAgainst == 0, "Cannot cancel after voting started");
        reports[reportId].resolved = true;
        reports[reportId].status = ReportStatus.Rejected;
        cancelled[reportId] = true;
        _refund(reportId);
    }

    // Anyone can release a stalled report after its deadline. All participants reclaim principal.
    function expireReport(uint256 reportId) external reportExists(reportId) notResolved(reportId) {
        require(block.timestamp > reports[reportId].votingDeadline, "Voting period not ended");
        require(reports[reportId].votesFor + reports[reportId].votesAgainst < minimumVotes, "Use resolution");
        reports[reportId].resolved = true;
        reports[reportId].status = ReportStatus.Rejected;
        cancelled[reportId] = true;
    }

    function updateMinimumStake(uint256 newMinimumStake) external onlyOwner {
        require(newMinimumStake > 0, "Stake must be positive");
        minimumStake = newMinimumStake;
    }
    
    function updateVotingPeriod(uint256 newVotingPeriod) external onlyOwner {
        require(newVotingPeriod >= 1 days && newVotingPeriod <= 30 days, "Invalid period");
        votingPeriod = newVotingPeriod;
    }
    
    function updateMinimumVotes(uint256 newMinimumVotes) external onlyOwner {
        require(newMinimumVotes >= 3, "Minimum 3 votes required");
        minimumVotes = newMinimumVotes;
    }
    
    function fundRewardPool() external payable {
        require(msg.value > 0, "Must send funds");
        rewardPool += msg.value;
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= rewardPool, "Cannot withdraw escrow");
        rewardPool -= amount;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function getReport(uint256 reportId) external view reportExists(reportId) returns (string memory productId, address reporter, uint256 timestamp, string memory reason, string memory evidence, uint256 stake, ReportStatus status, uint256 votesFor, uint256 votesAgainst, uint256 votingDeadline, bool resolved, bool isCounterfeit) {
        CounterfeitReport memory report = reports[reportId];
        return (report.productId, report.reporter, report.timestamp, report.reason, report.evidence, report.stake, report.status, report.votesFor, report.votesAgainst, report.votingDeadline, report.resolved, report.isCounterfeit);
    }
    
    function getProductReports(string memory productId) external view returns (uint256[] memory) {
        return productReports[productId];
    }
    
    function getReporterReports(address reporter) external view returns (uint256[] memory) {
        return reporterReports[reporter];
    }
    
    function getReportVotes(uint256 reportId) external view reportExists(reportId) returns (Vote[] memory) {
        return reportVotes[reportId];
    }
    
    function hasVotedOnReport(uint256 reportId, address voter) external view returns (bool) {
        return hasVoted[reportId][voter];
    }
    
    function getReporterStats(address reporter) external view returns (uint256 totalReportsCount, uint256 accurateReportsCount, uint256 accuracyPercentage) {
        return (totalReports[reporter], accurateReports[reporter], reporterAccuracy[reporter]);
    }
    
    function getTotalReports() external view returns (uint256) {
        return reportCounter;
    }
    
    function getVotingStatus(uint256 reportId) external view reportExists(reportId) returns (bool isOpen, uint256 timeRemaining, bool hasMinimumVotes) {
        CounterfeitReport memory report = reports[reportId];
        bool open = block.timestamp <= report.votingDeadline && !report.resolved;
        uint256 remaining = open ? report.votingDeadline - block.timestamp : 0;
        bool minVotes = (report.votesFor + report.votesAgainst) >= minimumVotes;
        return (open, remaining, minVotes);
    }
    
    function getPendingReports() external view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        for (uint256 i = 1; i <= reportCounter; i++) {
            if (!reports[i].resolved && block.timestamp <= reports[i].votingDeadline) {
                pendingCount++;
            }
        }
        uint256[] memory pending = new uint256[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= reportCounter; i++) {
            if (!reports[i].resolved && block.timestamp <= reports[i].votingDeadline) {
                pending[index] = i;
                index++;
            }
        }
        return pending;
    }
    
    function getProductReportSummary(string memory productId) external view returns (uint256 confirmedCounterfeit, uint256 confirmedAuthentic) {
        uint256[] memory reportIds = productReports[productId];
        uint256 counterfeitCount = 0;
        uint256 authenticCount = 0;
        for (uint256 i = 0; i < reportIds.length; i++) {
            CounterfeitReport memory report = reports[reportIds[i]];
            if (report.resolved && !cancelled[reportIds[i]]) {
                if (report.isCounterfeit) {
                    counterfeitCount++;
                } else {
                    authenticCount++;
                }
            }
        }
        return (counterfeitCount, authenticCount);
    }
    
    function calculatePotentialReward(uint256 reportId) external view reportExists(reportId) returns (uint256 potentialReward) {
        uint256 voteStake = minimumStake / 2;
        return voteStake;
    }
    
    function getRewardPoolBalance() external view returns (uint256) {
        return rewardPool;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
