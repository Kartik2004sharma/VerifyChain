import { headers } from "next/headers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "VerifyChain — Product passports",
    template: "%s · VerifyChain",
  },
  description:
    "Inspect a product’s registration, metadata integrity and supply-chain records on Ethereum Sepolia. Public verification requires no wallet.",
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable}`}>
        <Providers nonce={nonce}>
          <a href="#content" className="skip">
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
