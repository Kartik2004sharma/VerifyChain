const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CounterfeitReporter contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy CounterfeitReporter
  console.log("📦 Deploying CounterfeitReporter...");
  const CounterfeitReporter = await hre.ethers.getContractFactory("CounterfeitReporter");
  const counterfeitReporter = await CounterfeitReporter.deploy();

  await counterfeitReporter.waitForDeployment();
  const address = await counterfeitReporter.getAddress();
  
  console.log("✅ CounterfeitReporter deployed to:", address);

  // Wait for confirmations
  console.log("⏳ Waiting for 5 block confirmations...");
  await counterfeitReporter.deploymentTransaction().wait(5);
  console.log("✅ CounterfeitReporter confirmed\n");

  // Get initial settings
  const minimumStake = await counterfeitReporter.minimumStake();
  const votingPeriod = await counterfeitReporter.votingPeriod();
  const minimumVotes = await counterfeitReporter.minimumVotes();

  console.log("⚙️  Initial Configuration:");
  console.log("   Minimum Stake:", hre.ethers.formatEther(minimumStake), "ETH");
  console.log("   Voting Period:", Number(votingPeriod) / 86400, "days");
  console.log("   Minimum Votes:", minimumVotes.toString(), "\n");

  console.log("=" + "=".repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" + "=".repeat(70));
  console.log("\n📋 Contract Address:\n");
  console.log("  CounterfeitReporter:", address);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Remaining Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  if (hre.network.name === "sepolia") {
    console.log("\n🔗 View on Etherscan:");
    console.log("  https://sepolia.etherscan.io/address/" + address);
  }

  console.log("\n📝 Update your .env.local file with:");
  console.log(`NEXT_PUBLIC_SEPOLIA_COUNTERFEIT_REPORTER_ADDRESS=${address}`);
  
  console.log("\n📝 Next Steps:");
  console.log("  1. Update .env.local with the contract address above");
  console.log("  2. Verify contract: npx hardhat verify --network sepolia " + address);
  console.log("  3. Build frontend interface for counterfeit reporting");
  console.log("  4. Test the reporting and voting system");
  console.log("\n" + "=".repeat(72) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n", error);
    process.exit(1);
  });
