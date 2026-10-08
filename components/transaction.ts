"use client";
import { useEffect, useRef, useState } from "react";
import { getAccount } from "@wagmi/core";
import { walletConfig } from "@/lib/wagmi-config";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  decodeEventLog,
  keccak256,
  toHex,
  type Abi,
  type Address,
  type Hex,
} from "viem";
export type TxState = {
  phase:
    | "idle"
    | "awaiting_wallet"
    | "submitted"
    | "confirming"
    | "confirmed"
    | "rejected"
    | "reverted"
    | "uncertain"
    | "failed";
  hash?: Hex;
  message?: string;
};
type Attempt = {
  address: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
  event: string;
  account: Address;
};
function matchesReceipt(
  logs: readonly { address: Address; data: Hex; topics: readonly Hex[] }[],
  address: Address,
  abi: Abi,
  event: string,
  args: readonly unknown[],
  expectedAccount: Address,
) {
  return logs.some((log) => {
    if (log.address.toLowerCase() !== address.toLowerCase()) return false;
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (decoded.eventName !== event) return false;
      if (
        [
          "ProductRegistered",
          "SupplyChainStepAdded",
          "SupplyChainCompleted",
        ].includes(event) &&
        log.topics[1] !== keccak256(toHex(String(args[0])))
      )
        return false;
      if (event === "ProductRegistered") {
        const values = decoded.args as {
          manufacturer?: Address;
          dataHash?: Hex;
        };
        return (
          values.manufacturer?.toLowerCase() ===
            expectedAccount?.toLowerCase() && values.dataHash === args[2]
        );
      }
      return true;
    } catch {
      return false;
    }
  });
}
export function useTransaction() {
  const account = useAccount();
  const client = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [state, setState] = useState<TxState>({ phase: "idle" });
  const lock = useRef(false);
  const identity = useRef(account.address);
  const epoch = useRef(0);
  const attempt = useRef<Attempt | null>(null);
  useEffect(() => {
    if (identity.current !== account.address) {
      identity.current = account.address;
      epoch.current++;
      if (!lock.current) setState({ phase: "idle" });
    }
  }, [account.address]);
  async function send({
    address,
    abi,
    functionName,
    args,
    event,
  }: {
    address: Address;
    abi: Abi;
    functionName: string;
    args: readonly unknown[];
    event: string;
  }) {
    if (lock.current)
      throw new Error(
        "An attempt is already in progress. Inspect its transaction before retrying.",
      );
    if (
      !account.address ||
      account.chainId !== 11155111 ||
      !client ||
      getAccount(walletConfig).address !== account.address
    )
      throw new Error("Connect your wallet on Sepolia first.");
    attempt.current = {
      address,
      abi,
      functionName,
      args,
      event,
      account: account.address,
    };
    lock.current = true;
    const generation = epoch.current;
    let submitted = false;
    try {
      if ((await client.getChainId()) !== 11155111)
        throw new Error("Wallet RPC is on the wrong chain");
      await client.simulateContract({
        address,
        abi,
        functionName,
        args,
        account: account.address,
      });
      setState({ phase: "awaiting_wallet" });
      const hash = await writeContractAsync({
        address,
        abi,
        functionName,
        args,
        chainId: 11155111,
      });
      submitted = true;
      setState({ phase: "submitted", hash });
      setState({ phase: "confirming", hash });
      const receipt = await client.waitForTransactionReceipt({
        hash,
        confirmations: 2,
        timeout: 120000,
        onReplaced: (replacement) => {
          if (replacement.reason === "cancelled")
            setState({
              phase: "uncertain",
              hash: replacement.transaction.hash,
              message:
                "Transaction cancelled. Inspect the receipt before starting another attempt.",
            });
          else
            setState({
              phase: "confirming",
              hash: replacement.transaction.hash,
              message: "Wallet replaced the transaction; checking its receipt.",
            });
        },
      });
      if (receipt.status !== "success") {
        lock.current = false;
        setState({
          phase: "reverted",
          hash: receipt.transactionHash,
          message: "Transaction reverted. Your entries are retained.",
        });
        throw new Error("Transaction reverted");
      }
      const matched = matchesReceipt(
        receipt.logs,
        address,
        abi,
        event,
        args,
        account.address,
      );
      if (!matched)
        throw new Error(
          "Expected event missing. Inspect the receipt; do not resubmit.",
        );
      if (generation !== epoch.current)
        throw new Error(
          "Wallet account changed during confirmation. Inspect the submitted receipt.",
        );
      setState({ phase: "confirmed", hash: receipt.transactionHash });
      lock.current = false;
      return receipt;
    } catch (e) {
      const message =
        e instanceof Error ? e.message.split("\n")[0] : "Transaction failed";
      if (submitted) {
        setState((prev) =>
          prev.phase === "reverted"
            ? prev
            : { ...prev, phase: "uncertain", message },
        );
      } else {
        setState({
          phase: /reject|denied/i.test(message) ? "rejected" : "failed",
          message,
        });
        lock.current = false;
      }
      throw e;
    }
  }
  async function recover() {
    const previous = attempt.current;
    if (state.phase !== "uncertain" || !state.hash || !previous || !client)
      throw new Error("No unresolved receipt to recheck");
    try {
      const receipt = await client.waitForTransactionReceipt({
        hash: state.hash,
        confirmations: 2,
        timeout: 120000,
      });
      if (receipt.status !== "success") {
        lock.current = false;
        setState({
          phase: "reverted",
          hash: receipt.transactionHash,
          message: "Receipt confirms a revert. You may review and retry.",
        });
        return false;
      }
      if (
        !matchesReceipt(
          receipt.logs,
          previous.address,
          previous.abi,
          previous.event,
          previous.args,
          previous.account,
        )
      )
        throw new Error(
          "Receipt does not contain the intended event. Keep this transaction for review.",
        );
      if (account.address !== previous.account)
        throw new Error(
          "Reconnect the wallet that submitted this attempt before confirming its form.",
        );
      lock.current = false;
      setState({ phase: "confirmed", hash: receipt.transactionHash });
      return true;
    } catch (e) {
      setState((v) => ({
        ...v,
        phase: "uncertain",
        message:
          e instanceof Error
            ? e.message.split("\n")[0]
            : "Receipt remains unresolved",
      }));
      throw e;
    }
  }
  function reset() {
    if (lock.current) return;
    epoch.current++;
    setState({ phase: "idle" });
  }
  return {
    state,
    send,
    recover,
    reset,
    busy: ["awaiting_wallet", "submitted", "confirming", "uncertain"].includes(
      state.phase,
    ),
  };
}
