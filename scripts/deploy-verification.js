const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║          VerifyChain Smart Contract Deployment                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString(), "\n");

  // ============ 1. Deploy ProductRegistry ============
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║  1/3: Deploying ProductRegistry Contract                      ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  console.log("Deploying ProductRegistry...");
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("✅ ProductRegistry deployed to:", productRegistryAddress);
  
  // Wait for block confirmations
  console.log("Waiting for 2 block confirmations...");
  await productRegistry.deploymentTransaction().wait(2);
  console.log("✅ Confirmed!\n");

  // ============ 2. Deploy VerificationRegistry ============
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║  2/3: Deploying VerificationRegistry Contract                 ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  const VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
  console.log("Deploying VerificationRegistry...");
  const verificationRegistry = await VerificationRegistry.deploy();
  await verificationRegistry.waitForDeployment();
  const verificationRegistryAddress = await verificationRegistry.getAddress();
  console.log("✅ VerificationRegistry deployed to:", verificationRegistryAddress);
  
  console.log("Waiting for 2 block confirmations...");
  await verificationRegistry.deploymentTransaction().wait(2);
  console.log("✅ Confirmed!\n");

  // ============ 3. Deploy SupplyChainTrackerForCounterfeit ============
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║  3/3: Deploying SupplyChainTracker Contract                   ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  const SupplyChainTracker = await ethers.getContractFactory("SupplyChainTrackerForCounterfeit");
  console.log("Deploying SupplyChainTrackerForCounterfeit...");
  const supplyChainTracker = await SupplyChainTracker.deploy();
  await supplyChainTracker.waitForDeployment();
  const supplyChainTrackerAddress = await supplyChainTracker.getAddress();
  console.log("✅ SupplyChainTracker deployed to:", supplyChainTrackerAddress);
  
  console.log("Waiting for 2 block confirmations...");
  await supplyChainTracker.deploymentTransaction().wait(2);
  console.log("✅ Confirmed!\n");

  // ============ Deployment Summary ============
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                    Deployment Summary                          ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("\n📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ProductRegistry:         ", productRegistryAddress);
  console.log("VerificationRegistry:    ", verificationRegistryAddress);
  console.log("SupplyChainTracker:      ", supplyChainTrackerAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ============ Save Deployment Info ============
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ProductRegistry: {
        address: productRegistryAddress,
        constructorArgs: [],
      },
      VerificationRegistry: {
        address: verificationRegistryAddress,
        constructorArgs: [],
      },
      SupplyChainTracker: {
        address: supplyChainTrackerAddress,
        constructorArgs: [],
      },
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", filepath, "\n");

  // ============ Environment Variables ============
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║          Add these to your .env.local file                    ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  const envPrefix = network.name === "sepolia" ? "SEPOLIA" : network.name.toUpperCase();
  console.log(`NEXT_PUBLIC_${envPrefix}_PRODUCT_REGISTRY_ADDRESS=${productRegistryAddress}`);
  console.log(`NEXT_PUBLIC_${envPrefix}_VERIFICATION_REGISTRY_ADDRESS=${verificationRegistryAddress}`);
  console.log(`NEXT_PUBLIC_${envPrefix}_SUPPLY_CHAIN_TRACKER_ADDRESS=${supplyChainTrackerAddress}\n`);

  // ============ Verification Instructions ============
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║              Verify Contracts on Etherscan                    ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("Run these commands after deployment:\n");
    console.log(`npx hardhat verify --network ${network.name} ${productRegistryAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${verificationRegistryAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${supplyChainTrackerAddress}\n`);
  }

  // ============ Next Steps ============
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║                      Next Steps                                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("1. ✅ Contracts deployed successfully");
  console.log("2. 📝 Update .env.local with the addresses above");
  console.log("3. 🔍 Verify contracts on Etherscan (if on testnet/mainnet)");
  console.log("4. 🔄 Update blockchain-verification.ts with real contract addresses");
  console.log("5. 🧪 Test verification flow on the dashboard");
  console.log("6. 🚀 Deploy frontend with updated contract addresses\n");

  console.log("✨ Deployment completed successfully! ✨\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
