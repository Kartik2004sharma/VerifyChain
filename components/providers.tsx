"use client";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
export function Providers({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  useEffect(() => {
    document.documentElement.dataset.compact =
      localStorage.getItem("verifychain:compact") ?? "false";
  }, []);
  return (
    <ThemeProvider
      nonce={nonce}
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
