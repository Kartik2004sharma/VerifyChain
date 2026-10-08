import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  type Address,
  type Abi,
} from "viem";
import { sepolia } from "@/lib/domain/network";
import fs from "node:fs";
import {
  ProductRegistryABI,
  SupplyChainTrackerABI,
  VerificationRegistryABI,
} from "@/lib/contracts/abis";
import { metadataHash } from "@/lib/domain/metadata";
const boundary = vi.hoisted(() => ({ config: null as unknown }));
vi.mock("@/lib/server/config", () => ({ serverConfig: () => boundary.config }));
import { verifyProduct, supply, history, products } from "@/lib/server/chain";
const metadata = {
  schema: "verifychain.product.v1",
  productId: "LOCAL-界-001",
  name: "Integration product",
  category: "Test",
  description: "Isolated test chain only",
  origin: "Local",
  serial: "001",
};
const transport = http(process.env.LOCAL_INTEGRATION_RPC);
const client = createPublicClient({ chain: sepolia, transport });
let snapshot: string;
let wallet: ReturnType<typeof createWalletClient>, owner: Address;
const contracts: Record<
  string,
  {
    address: Address;
    codeHash: `0x${string}`;
    block: string;
    transactionHash: `0x${string}`;
  }
> = {};
async function write(
  address: Address,
  abi: readonly unknown[],
  functionName: string,
  args: readonly unknown[],
) {
  const hash = await wallet.writeContract({
    address,
    abi: abi as Abi,
    functionName,
    args,
    chain: sepolia,
    account: owner,
  });
  await client.waitForTransactionReceipt({ hash });
  return hash;
}
beforeAll(async () => {
  wallet = createWalletClient({ chain: sepolia, transport });
  owner = (await wallet.getAddresses())[0];
  for (const name of [
    "ProductRegistry",
    "VerificationRegistry",
    "SupplyChainTracker",
  ]) {
    const a = JSON.parse(
      fs.readFileSync(`artifacts/contracts/${name}.sol/${name}.json`, "utf8"),
    );
    const hash = await wallet.deployContract({
      abi: a.abi,
      bytecode: a.bytecode,
      chain: sepolia,
      account: owner,
    });
    const r = await client.waitForTransactionReceipt({ hash });
    if (!r.contractAddress) throw new Error("Missing local deployment");
    const code = await client.getCode({ address: r.contractAddress });
    contracts[name] = {
      address: r.contractAddress,
      codeHash: keccak256(code!),
      block: String(r.blockNumber),
      transactionHash: hash,
    };
  }
  boundary.config = { client, contracts };
  const original = global.fetch;
  vi.spyOn(global, "fetch").mockImplementation((url, options) =>
    String(url).startsWith("https://gateway.pinata.cloud/ipfs/")
      ? Promise.resolve(Response.json(metadata))
      : original(url, options),
  );
  await write(
    contracts.ProductRegistry.address,
    ProductRegistryABI,
    "registerManufacturer",
    ["Local factory"],
  );
  snapshot = (
    await (
      await fetch(process.env.LOCAL_INTEGRATION_RPC!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "evm_snapshot",
          params: [],
        }),
      })
    ).json()
  ).result;
  await write(
    contracts.ProductRegistry.address,
    ProductRegistryABI,
    "registerProduct",
    [
      metadata.productId,
      metadata.name,
      metadataHash(metadata),
      "ipfs://" + "a".repeat(46),
    ],
  );
});
afterAll(() => vi.restoreAllMocks());
describe("Actual local Solidity through application read service; metadata retrieval fixture", () => {
  it("public passport reconciles product, manufacturer, hash, event and receipt", async () => {
    const p = await verifyProduct(metadata.productId);
    expect(p.status).toBe("registered");
    expect(p.integrity).toBe("match");
    expect(p.manufacturer?.address).toBe(owner);
    expect(p.transactionHash).toMatch(/^0x[0-9a-f]{64}$/);
    const r = await client.getTransactionReceipt({
      hash: p.transactionHash as `0x${string}`,
    });
    expect(r.status).toBe("success");
    expect(await products(owner)).toContain(metadata.productId);
  });
  it("not found is separate from counterfeit", async () =>
    expect((await verifyProduct("UNKNOWN")).status).toBe("not_found"));
  it("actual checkpoints and observations retain original string ID", async () => {
    await write(
      contracts.SupplyChainTracker.address,
      SupplyChainTrackerABI,
      "initializeSupplyChain",
      [
        metadata.productId,
        "Local facility",
        "manufactured",
        metadataHash(metadata),
        "Test",
      ],
    );
    const journey = await supply(metadata.productId);
    expect(journey.steps[0].location).toBe("Local facility");
    await write(
      contracts.VerificationRegistry.address,
      VerificationRegistryABI,
      "recordVerification",
      [metadata.productId, true, 80, "", metadataHash(metadata)],
    );
    expect((await history(metadata.productId))[0].confidenceScore).toBe(80);
  });
  it("revocation readback cannot yield registered verdict", async () => {
    await write(
      contracts.ProductRegistry.address,
      ProductRegistryABI,
      "revokeProduct",
      [metadata.productId, "Local test"],
    );
    expect((await verifyProduct(metadata.productId)).status).toBe("revoked");
  });
});

it("reorg rollback invalidates a formerly registered record C06 V08", async () => {
  const response = await fetch(process.env.LOCAL_INTEGRATION_RPC!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "evm_revert",
      params: [snapshot],
    }),
  });
  expect((await response.json()).result).toBe(true);
  expect((await verifyProduct(metadata.productId)).status).toBe("not_found");
});
