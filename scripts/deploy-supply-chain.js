const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SupplyChainTracker contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy SupplyChainTracker
  console.log("📦 Deploying SupplyChainTracker...");
  const SupplyChainTracker = await hre.ethers.getContractFactory("SupplyChainTracker");
  const supplyChainTracker = await SupplyChainTracker.deploy();

  await supplyChainTracker.waitForDeployment();
  const address = await supplyChainTracker.getAddress();
  
  console.log("✅ SupplyChainTracker deployed to:", address);

  // Wait for confirmations
  console.log("⏳ Waiting for 5 block confirmations...");
  await supplyChainTracker.deploymentTransaction().wait(5);
  console.log("✅ SupplyChainTracker confirmed\n");

  // Authorize deployer as initial handler
  console.log("🔐 Authorizing deployer as supply chain handler...");
  const authTx = await supplyChainTracker.authorizeHandler(deployer.address);
  await authTx.wait();
  console.log("✅ Deployer authorized as handler\n");

  console.log("=" + "=".repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" + "=".repeat(70));
  console.log("\n📋 Contract Address:\n");
  console.log("  SupplyChainTracker:", address);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Remaining Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  if (hre.network.name === "sepolia") {
    console.log("\n🔗 View on Etherscan:");
    console.log("  https://sepolia.etherscan.io/address/" + address);
  }

  console.log("\n📝 Update your .env.local file with:");
  console.log(`NEXT_PUBLIC_SEPOLIA_SUPPLY_CHAIN_TRACKER_ADDRESS=${address}`);
  
  console.log("\n📝 Next Steps:");
  console.log("  1. Update .env.local with the contract address above");
  console.log("  2. Verify contract: npx hardhat verify --network sepolia " + address);
  console.log("  3. Test the deployment on your dashboard");
  console.log("\n" + "=".repeat(72) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n", error);
    process.exit(1);
  });
