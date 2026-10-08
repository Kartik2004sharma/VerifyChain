import fs from "node:fs";
import {
  createPublicClient,
  http,
  isAddress,
  zeroAddress,
  keccak256,
} from "viem";
import { sepolia } from "../lib/domain/network.ts";
const expected = JSON.parse(
  fs.readFileSync("lib/contracts/source-identity.json", "utf8"),
);
const manifest = JSON.parse(
  fs.readFileSync(
    process.env.RELEASE_MANIFEST ?? "deployments/manifest.json",
    "utf8",
  ),
);
try {
  if (manifest.chainId !== sepolia.id)
    throw new Error("Manifest must select Ethereum Sepolia");
  if (
    !process.env.SEPOLIA_RPC_URL ||
    new URL(process.env.SEPOLIA_RPC_URL).protocol !== "https:"
  )
    throw new Error("HTTPS Sepolia RPC required");
  const client = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL, {
      timeout: 8000,
      retryCount: 0,
    }),
  });
  if ((await client.getChainId()) !== sepolia.id)
    throw new Error("RPC chain mismatch");
  for (const name of [
    "ProductRegistry",
    "VerificationRegistry",
    "SupplyChainTracker",
  ]) {
    const c = manifest.contracts[name];
    if (
      c?.codeHash !== expected[name].codeHash ||
      c?.sourceHash !== expected[name].sourceHash ||
      c?.abiHash !== expected[name].abiHash
    )
      throw new Error(`${name} source/ABI identity mismatch`);
    if (
      !c ||
      !isAddress(c.address) ||
      c.address === zeroAddress ||
      !c.codeHash ||
      !c.transactionHash
    )
      throw new Error(`Missing verified deployment: ${name}`);
    const code = await client.getCode({ address: c.address });
    if (!code || keccak256(code) !== c.codeHash)
      throw new Error(`${name} code mismatch`);
    const receipt = await client.getTransactionReceipt({
      hash: c.transactionHash,
    });
    if (
      receipt.status !== "success" ||
      receipt.contractAddress?.toLowerCase() !== c.address.toLowerCase() ||
      String(receipt.blockNumber) !== c.block
    )
      throw new Error(`${name} deployment receipt mismatch`);
  }
  const origin = process.env.RELEASE_ORIGIN;
  if (!origin || new URL(origin).protocol !== "https:")
    throw new Error("Verified HTTPS hosted origin required");
  const live = await fetch(`${origin}/api/health/live`);
  if (!live.ok) throw new Error("Hosted liveness failed");
  const ready = await fetch(`${origin}/api/health/ready`);
  if (!ready.ok) throw new Error("Hosted readiness failed");
  if (!process.env.RELEASE_PRODUCT_ID)
    throw new Error(
      "Real registered product ID required to prove retrievable metadata",
    );
  const result = await fetch(`${origin}/api/blockchain/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: process.env.RELEASE_PRODUCT_ID }),
  });
  const passport = await result.json();
  if (
    !result.ok ||
    passport.status !== "registered" ||
    passport.integrity !== "match" ||
    passport.chainId !== sepolia.id
  )
    throw new Error("Hosted product/metadata evidence failed");
  if (!process.env.RELEASE_TRANSACTION_HASH)
    throw new Error("Real user-approved registration receipt required");
  const receipt = await client.getTransactionReceipt({
    hash: process.env.RELEASE_TRANSACTION_HASH,
  });
  if (
    receipt.status !== "success" ||
    receipt.to?.toLowerCase() !==
      manifest.contracts.ProductRegistry.address.toLowerCase() ||
    receipt.transactionHash !== passport.transactionHash
  )
    throw new Error(
      "Registration receipt does not reconcile with public passport",
    );
  console.log(
    JSON.stringify(
      {
        passed: true,
        chainId: sepolia.id,
        origin,
        productId: passport.productId,
        transactionHash: receipt.transactionHash,
        block: String(receipt.blockNumber),
      },
      null,
      2,
    ),
  );
} catch (e) {
  console.error(`RELEASE BLOCKED: ${e.message}`);
  process.exitCode = 1;
}
