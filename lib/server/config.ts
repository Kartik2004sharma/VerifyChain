import "server-only";
import {
  createPublicClient,
  http,
  isAddress,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "@/lib/domain/network";
import identity from "@/lib/contracts/source-identity.json";
import manifest from "@/deployments/manifest.json";
const names = [
  "ProductRegistry",
  "VerificationRegistry",
  "SupplyChainTracker",
] as const;
export type ContractName = (typeof names)[number];
export function serverConfig() {
  const rpc = process.env.SEPOLIA_RPC_URL;
  if (!rpc) throw new Error("Server RPC is not configured");
  const url = new URL(rpc);
  if (url.protocol !== "https:" || /example|YOUR_|placeholder/i.test(rpc))
    throw new Error("Invalid Sepolia RPC");
  const contracts = manifest.contracts as Partial<
    Record<
      ContractName,
      { address: Address; block: string; transactionHash: Hex; codeHash: Hex }
    >
  >;
  for (const name of names) {
    const c = contracts[name];
    if (c?.codeHash !== identity[name].codeHash)
      throw new Error(`Manifest source identity mismatch: ${name}`);
    if (
      !c ||
      !isAddress(c.address) ||
      c.address === zeroAddress ||
      !/^0x[0-9a-f]{64}$/i.test(c.codeHash) ||
      !/^0x[0-9a-f]{64}$/i.test(c.transactionHash) ||
      !/^\d+$/.test(c.block)
    )
      throw new Error(`Verified manifest missing ${name}`);
  }
  if (manifest.chainId !== sepolia.id) throw new Error("Wrong manifest chain");
  return {
    contracts: contracts as Record<
      ContractName,
      { address: Address; block: string; transactionHash: Hex; codeHash: Hex }
    >,
    client: createPublicClient({
      chain: sepolia,
      transport: http(rpc, { timeout: 8000, retryCount: 0 }),
    }),
  };
}
