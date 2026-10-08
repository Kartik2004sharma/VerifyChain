import { WalletProvider } from "@/components/wallet-provider";
import { Shell } from "@/components/shell";
import { Verify } from "@/components/verify";
export default function Page() {
  return (
    <WalletProvider>
      <Shell>
        <Verify />
      </Shell>
    </WalletProvider>
  );
}
