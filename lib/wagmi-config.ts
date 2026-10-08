import { createConfig, http } from "wagmi";
import { injected } from "@wagmi/core";
import { sepolia } from "@/lib/domain/network";
export const walletConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: { [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL) },
});
