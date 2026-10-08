"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Layers3, Sun, Moon } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="VerifyChain home">
      <span className="brand-mark">
        <Layers3 size={22} strokeWidth={1.8} />
      </span>
      <span>VerifyChain</span>
    </Link>
  );
}
export function AppearanceToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      className="icon-button appearance-toggle"
      aria-label={
        dark ? "Switch to light appearance" : "Switch to dark appearance"
      }
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
