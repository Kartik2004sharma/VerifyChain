const hre = require("hardhat");

async function main() {
  console.log("💰 Checking Wallet Balance...\n");

  const [deployer] = await hre.ethers.getSigners();
  const address = deployer.address;
  const balance = await hre.ethers.provider.getBalance(address);
  const balanceInEth = hre.ethers.formatEther(balance);

  console.log("📍 Network:", hre.network.name);
  console.log("👤 Address:", address);
  console.log("💵 Balance:", balanceInEth, "ETH");

  // Estimate gas needed for deployments
  const estimatedGasForDeployment = "0.05"; // Conservative estimate

  console.log("\n📊 Deployment Estimates:");
  console.log("   Estimated gas needed: ~", estimatedGasForDeployment, "ETH");
  
  if (parseFloat(balanceInEth) < parseFloat(estimatedGasForDeployment)) {
    console.log("\n⚠️  WARNING: Low balance!");
    console.log("   You may need more ETH for deployment.");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com");
  } else {
    console.log("\n✅ Balance sufficient for deployment!");
  }

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
