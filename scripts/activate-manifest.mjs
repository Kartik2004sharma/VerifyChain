import fs from "node:fs";
import { createPublicClient, http, keccak256 } from "viem";
import { sepolia } from "../lib/domain/network.ts";
const expected = JSON.parse(
  fs.readFileSync("lib/contracts/source-identity.json", "utf8"),
);
const file = process.argv[2];
if (!file || !file.startsWith("deployments/"))
  throw new Error("Supply a reviewed deployment history file");
const m = JSON.parse(fs.readFileSync(file, "utf8"));
if (m.chainId !== 11155111)
  throw new Error("Only Sepolia manifests can be activated");
for (const name of [
  "ProductRegistry",
  "VerificationRegistry",
  "SupplyChainTracker",
])
  if (!m.contracts[name]) throw new Error(`Incomplete deployment: ${name}`);
const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL),
});
if ((await client.getChainId()) !== 11155111)
  throw new Error("Wrong RPC chain");
for (const [name, c] of Object.entries(m.contracts)) {
  if (
    c.codeHash !== expected[name]?.codeHash ||
    c.sourceHash !== expected[name]?.sourceHash ||
    c.abiHash !== expected[name]?.abiHash
  )
    throw new Error("Source or ABI identity mismatch");
  const code = await client.getCode({ address: c.address });
  const r = await client.getTransactionReceipt({ hash: c.transactionHash });
  if (
    !code ||
    keccak256(code) !== c.codeHash ||
    r.status !== "success" ||
    r.contractAddress?.toLowerCase() !== c.address.toLowerCase()
  )
    throw new Error("Deployment identity mismatch");
}
m.status = "verified-source-v2";
fs.writeFileSync(
  "deployments/manifest.json",
  JSON.stringify(m, null, 2) + "\n",
);
console.log(
  "Active manifest updated after bytecode and receipt checks. Rebuild the web app.",
);
