const fs = require("node:fs");
const crypto = require("node:crypto");
const { ethers, network, artifacts } = require("hardhat");
async function main() {
  if (!["sepolia", "localhost", "hardhat"].includes(network.name))
    throw new Error("Unsupported network");
  const [signer] = await ethers.getSigners();
  if (!signer) throw new Error("Deployment signer missing");
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  if (network.name === "sepolia" && chainId !== 11155111)
    throw new Error("Wrong network");
  const contracts = {};
  const path = `deployments/${network.name}-${Date.now()}-v2.json`;
  const journal = {
    schema: 1,
    network: network.name,
    chainId,
    status: "deploying",
    contracts,
  };
  fs.writeFileSync(path, JSON.stringify(journal, null, 2) + "\n");
  for (const name of [
    "ProductRegistry",
    "VerificationRegistry",
    "SupplyChainTracker",
  ]) {
    const c = await (await ethers.getContractFactory(name)).deploy();
    await c.waitForDeployment();
    const tx = c.deploymentTransaction();
    contracts[name] = {
      address: await c.getAddress(),
      transactionHash: tx.hash,
      status: "submitted",
    };
    fs.writeFileSync(path, JSON.stringify(journal, null, 2) + "\n");
    console.log(`${name} submitted: ${tx.hash}`);
    const receipt = await tx.wait(2);
    if (!receipt || receipt.status !== 1)
      throw new Error("Deployment not confirmed");
    const address = await c.getAddress();
    contracts[name] = {
      address,
      block: String(receipt.blockNumber),
      transactionHash: tx.hash,
      codeHash: ethers.keccak256(await ethers.provider.getCode(address)),
      sourceHash: crypto
        .createHash("sha256")
        .update(fs.readFileSync(`contracts/${name}.sol`))
        .digest("hex"),
      abiHash: crypto
        .createHash("sha256")
        .update(JSON.stringify((await artifacts.readArtifact(name)).abi))
        .digest("hex"),
    };
    fs.writeFileSync(path, JSON.stringify(journal, null, 2) + "\n");
  }
  const manifest = {
    schema: 1,
    network: network.name,
    chainId,
    status: "deployed-awaiting-review",
    compiler: "0.8.20",
    optimizer: { enabled: true, runs: 200, viaIR: true },
    contracts,
  };
  fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Saved ${path}. Existing active manifest was preserved. Verify bytecode and receipts before activation.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
