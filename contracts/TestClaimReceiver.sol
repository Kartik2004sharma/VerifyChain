// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IReporter {function reportCounterfeit(string memory,string memory,string memory) external payable;function claimReward(uint256) external;function cancelReport(uint256) external;}
// Local security-test harness, deliberately excluded from production deployment scripts.
contract TestClaimReceiver {
    bool public reject = true;
    IReporter public reporter;
    constructor(address target){reporter=IReporter(target);}
    function report() external payable {reporter.reportCounterfeit{value:msg.value}("p","Concern","ipfs://e");}
    function claim(uint256 id) external {reporter.claimReward(id);}
    function accept() external {reject=false;}
    receive() external payable {require(!reject,"Recipient rejects");try reporter.claimReward(1){}catch{}}
}
