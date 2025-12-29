const hre = require("hardhat");

async function main() {
  console.log("Deploying ProductRegistry contract...");

  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();

  await productRegistry.waitForDeployment();

  const address = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", address);
  console.log("\nUpdate your .env.local file with:");
  console.log(`NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
