import { Shell } from "@/components/shell";
import { WalletProvider } from "@/components/wallet-provider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <Shell>{children}</Shell>
    </WalletProvider>
  );
}
