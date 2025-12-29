import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Web3Provider } from "@/components/Web3Provider";
import { Providers } from "@/components/providers";
import { WalletProvider } from "@/contexts/WalletContext";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "VerifyChain - Blockchain Product Authentication",
  description: "Research platform for blockchain-based counterfeit detection and product authentication",
  icons: {
    icon: "/verifychain-shield.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <Web3Provider>
              <Providers>
                {children}
              </Providers>
            </Web3Provider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
