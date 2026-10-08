"use client";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState } from "react";
export function Wallet() {
  const { address, chainId, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [error, setError] = useState("");
  return (
    <div className="wallet">
      <button
        className="button small"
        disabled={isPending}
        onClick={async () => {
          setError("");
          try {
            if (isConnected && chainId !== 11155111)
              await switchChainAsync({ chainId: 11155111 });
            else if (isConnected) disconnect();
            else {
              const connector = connectors[0];
              if (!connector)
                throw new Error(
                  "Install a browser wallet to register products.",
                );
              await connectAsync({ connector });
            }
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message.split("\n")[0]
                : "Wallet connection declined",
            );
          }
        }}
      >
        {isConnected
          ? chainId !== 11155111
            ? "Switch to Sepolia"
            : `${address?.slice(0, 6)}…${address?.slice(-4)} · Disconnect`
          : isPending
            ? "Connecting…"
            : "Connect wallet"}
      </button>
      {error && (
        <p className="error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
