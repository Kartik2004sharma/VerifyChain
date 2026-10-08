import "server-only";
import { keccak256, parseAbiItem, type Address } from "viem";
import { serverConfig } from "./config";
import {
  ProductRegistryABI,
  VerificationRegistryABI,
  SupplyChainTrackerABI,
} from "@/lib/contracts/abis";
import { inspectMetadata, productIdSchema } from "@/lib/domain/metadata";
import { verdict, type Passport } from "@/lib/domain/passport";
export async function ready() {
  const c = serverConfig();
  if ((await c.client.getChainId()) !== 11155111)
    throw new Error("RPC network mismatch");
  for (const contract of Object.values(c.contracts)) {
    const code = await c.client.getCode({ address: contract.address });
    if (!code || keccak256(code) !== contract.codeHash)
      throw new Error("Contract identity mismatch");
  }
  await c.client.readContract({
    address: c.contracts.ProductRegistry.address,
    abi: ProductRegistryABI,
    functionName: "getTotalProductCount",
  });
  return c;
}
export async function verifyProduct(input: unknown): Promise<Passport> {
  const parsed = productIdSchema.safeParse(input),
    productId = parsed.success
      ? parsed.data
      : String(input ?? "").slice(0, 100);
  const base = {
    productId,
    chainId: 11155111 as const,
    checkedAt: new Date().toISOString(),
  };
  if (!parsed.success)
    return {
      ...base,
      status: "invalid_input",
      message: "Enter a product ID of up to 100 UTF-8 bytes.",
    };
  try {
    const { client, contracts } = await ready();
    const address = contracts.ProductRegistry.address;
    const block = await client.getBlockNumber({ cacheTime: 0 });
    const read = { address, abi: ProductRegistryABI, blockNumber: block };
    if (
      !(await client.readContract({
        ...read,
        functionName: "isProductRegistered",
        args: [productId],
      }))
    )
      return {
        ...base,
        block: String(block),
        contract: address,
        status: "not_found",
        message:
          "No registration exists for this ID in the configured registry.",
      };
    const [name, owner, time, hash, active, uri] = await client.readContract({
      ...read,
      functionName: "getProduct",
      args: [productId],
    });
    const m = await client.readContract({
      ...read,
      functionName: "getManufacturer",
      args: [owner],
    });
    const registrationBlock = await client.readContract({
      ...read,
      functionName: "getProductBlockNumber",
      args: [productId],
    });
    let integrity: Passport["integrity"] = "unavailable",
      metadata: Passport["metadata"];
    // Only immutable IPFS CIDs accepted: contract-provided arbitrary URLs never fetched (SSRF boundary).
    if (/^ipfs:\/\/[a-zA-Z0-9]{46,100}$/.test(uri)) {
      try {
        const response = await fetch(
          `https://gateway.pinata.cloud/ipfs/${uri.slice(7)}`,
          {
            signal: AbortSignal.timeout(6000),
            cache: "no-store",
            redirect: "error",
          },
        );
        if (response.ok) {
          const reader = response.body?.getReader();
          let bytes = 0;
          const chunks: Uint8Array[] = [];
          if (!reader) throw new Error("No metadata");
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.length;
            if (bytes > 16000) {
              await reader.cancel();
              throw new Error("Metadata too large");
            }
            chunks.push(value);
          }
          const raw = Buffer.concat(chunks).toString("utf8");
          try {
            const inspected = inspectMetadata(
              JSON.parse(raw),
              hash,
              productId,
              name,
            );
            integrity = inspected.integrity;
            metadata = inspected.metadata;
          } catch {
            integrity = "mismatch";
          }
        }
      } catch {
        integrity = "unavailable";
      }
    }
    let transactionHash: string | null = null;
    try {
      const logs = await client.getLogs({
        address,
        event: parseAbiItem(
          "event ProductRegistered(string indexed productId, address indexed manufacturer, bytes32 dataHash, uint256 timestamp, uint256 blockNumber)",
        ),
        args: { productId },
        fromBlock: registrationBlock,
        toBlock: registrationBlock,
      });
      const unique = new Map(
        logs
          .filter((log) => !log.removed)
          .map((log) => [`${log.transactionHash}:${log.logIndex}`, log]),
      );
      if (unique.size === 1)
        transactionHash = [...unique.values()][0].transactionHash;
    } catch {
      /* Optional receipt resolution never changes registration verdict. */
    }
    return {
      ...base,
      status: verdict(active, integrity),
      message:
        "Registration records a wallet submission. It does not certify the brand or the physical item.",
      contract: address,
      block: String(block),
      name,
      manufacturer: {
        address: owner,
        companyName: m[0],
        active: m[2],
        trust: "self_registered",
      },
      commitment: hash,
      uri,
      metadata,
      integrity,
      registeredAt: Number(time),
      registrationBlock: String(registrationBlock),
      transactionHash,
    };
  } catch {
    return {
      ...base,
      status: "unavailable",
      message:
        "The configured blockchain service is unavailable. Retry after configuration or connectivity is restored.",
    };
  }
}
export async function products(owner: Address) {
  const { client, contracts } = await ready();
  const address = contracts.ProductRegistry.address;
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const count = await client.readContract({
    address,
    abi: ProductRegistryABI,
    functionName: "getManufacturerProductCount",
    args: [owner],
    blockNumber,
  });
  return client.readContract({
    address,
    abi: ProductRegistryABI,
    functionName: "getManufacturerProductsPage",
    args: [owner, count > 100n ? count - 100n : 0n, 100n],
    blockNumber,
  });
}
export async function history(id: string) {
  const { client, contracts } = await ready();
  const address = contracts.VerificationRegistry.address;
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const rows = await client.readContract({
    address,
    abi: VerificationRegistryABI,
    functionName: "getRecentVerifications",
    args: [id, 100n],
    blockNumber,
  });
  return rows;
}
export async function supply(id: string) {
  const { client, contracts } = await ready();
  const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
  const read = {
    blockNumber,
    address: contracts.SupplyChainTracker.address,
    abi: SupplyChainTrackerABI,
  };
  if (
    !(await client.readContract({
      ...read,
      functionName: "supplyChainExistsFor",
      args: [id],
    }))
  )
    return { steps: [], complete: false };
  const info = await client.readContract({
    ...read,
    functionName: "getSupplyChainInfo",
    args: [id],
  });
  const count = Number(info[1]);
  const steps = await Promise.all(
    Array.from({ length: Math.min(count, 100) }, (_, i) =>
      client.readContract({
        ...read,
        functionName: "getSupplyChainStep",
        args: [id, BigInt(i)],
      }),
    ),
  );
  return {
    steps: steps.map((s) => ({
      number: Number(s[0]),
      location: s[1],
      handler: s[2],
      timestamp: Number(s[3]),
      proof: s[4],
      verified: s[5],
      action: s[6],
      notes: s[7],
      block: String(s[8]),
    })),
    complete: info[4],
    total: count,
  };
}
