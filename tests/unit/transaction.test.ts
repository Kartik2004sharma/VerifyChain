// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { encodeAbiParameters, encodeEventTopics, type Hex } from "viem";
import { ProductRegistryABI } from "@/lib/contracts/abis";
import { useTransaction } from "@/components/transaction";
const env = vi.hoisted(() => ({
  account: {
    address: "0x2222222222222222222222222222222222222222",
    chainId: 11155111,
  },
  write: vi.fn(),
  simulate: vi.fn(),
  wait: vi.fn(),
  chain: vi.fn(),
}));
vi.mock("wagmi", () => ({
  useAccount: () => env.account,
  usePublicClient: () => ({
    getChainId: env.chain,
    simulateContract: env.simulate,
    waitForTransactionReceipt: env.wait,
  }),
  useWriteContract: () => ({ writeContractAsync: env.write }),
}));
vi.mock("@wagmi/core", () => ({ getAccount: () => env.account }));
vi.mock("@/lib/wagmi-config", () => ({ walletConfig: {} }));
const address = "0x1111111111111111111111111111111111111111",
  hash = ("0x" + "ab".repeat(32)) as Hex,
  commitment = ("0x" + "cd".repeat(32)) as Hex;
const input = {
  address,
  abi: ProductRegistryABI,
  functionName: "registerProduct",
  args: ["VC-01", "Coffee", commitment, "ipfs://test"],
  event: "ProductRegistered",
} as const;
function receipt(status = "success", id = "VC-01") {
  return {
    status,
    transactionHash: hash,
    logs: [
      {
        address,
        topics: encodeEventTopics({
          abi: ProductRegistryABI,
          eventName: "ProductRegistered",
          args: {
            productId: id,
            manufacturer: env.account.address as `0x${string}`,
          },
        }),
        data: encodeAbiParameters(
          [{ type: "bytes32" }, { type: "uint256" }, { type: "uint256" }],
          [commitment, 1n, 2n],
        ),
      },
    ],
  };
}
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  env.account = {
    address: "0x2222222222222222222222222222222222222222",
    chainId: 11155111,
  };
  env.chain.mockResolvedValue(11155111);
  env.simulate.mockResolvedValue({});
  env.write.mockResolvedValue(hash);
  env.wait.mockResolvedValue(receipt());
});
describe("Receipt-bound lifecycle R02-R05 A06 (mock wallet/RPC boundaries)", () => {
  it("confirms only expected product event and resets receipt for another form", async () => {
    const { result } = renderHook(() => useTransaction());
    await act(async () => {
      await result.current.send(input);
    });
    expect(result.current.state.phase).toBe("confirmed");
    expect(result.current.state.hash).toBe(hash);
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ phase: "idle" });
  });
  it("retains rejected/non-success states", async () => {
    env.write.mockRejectedValue(new Error("User rejected signature"));
    const { result } = renderHook(() => useTransaction());
    await act(async () => {
      await expect(result.current.send(input)).rejects.toThrow("rejected");
    });
    expect(result.current.state.phase).toBe("rejected");
    expect(env.wait).not.toHaveBeenCalled();
  });
  it("reverts do not confirm and do not permanently lock retry", async () => {
    env.wait.mockResolvedValueOnce(receipt("reverted"));
    const { result } = renderHook(() => useTransaction());
    await act(async () => {
      await expect(result.current.send(input)).rejects.toThrow("reverted");
    });
    expect(result.current.state.phase).toBe("reverted");
    await act(async () => {
      await result.current.send(input);
    });
    expect(result.current.state.phase).toBe("confirmed");
  });
  it("wrong chain blocks every write", async () => {
    env.account.chainId = 1;
    const { result } = renderHook(() => useTransaction());
    await act(async () => {
      await expect(result.current.send(input)).rejects.toThrow("Sepolia");
    });
    expect(env.write).not.toHaveBeenCalled();
  });
  it("double clicks cannot duplicate an attempt and dropped receipt stays inspectable", async () => {
    let reject: (e: Error) => void = () => {};
    env.wait.mockReturnValue(
      new Promise((_, r) => {
        reject = r;
      }),
    );
    const { result } = renderHook(() => useTransaction());
    let attempt: Promise<unknown> = Promise.resolve();
    act(() => {
      attempt = result.current.send(input).catch(() => {});
    });
    await waitFor(() => expect(result.current.state.phase).toBe("confirming"));
    await expect(result.current.send(input)).rejects.toThrow(
      "already in progress",
    );
    expect(env.write).toHaveBeenCalledTimes(1);
    await act(async () => {
      reject(new Error("Receipt timeout"));
      await attempt;
    });
    expect(result.current.state.phase).toBe("uncertain");
    expect(result.current.state.hash).toBe(hash);
    await expect(result.current.send(input)).rejects.toThrow(
      "already in progress",
    );
  });
  it("cannot confirm a replacement that registered a different ID", async () => {
    env.wait.mockResolvedValue(receipt("success", "OTHER"));
    const { result } = renderHook(() => useTransaction());
    await act(async () => {
      await expect(result.current.send(input)).rejects.toThrow(
        "Expected event missing",
      );
    });
    expect(result.current.state.phase).toBe("uncertain");
  });
  it("account change cannot auto-confirm the new account form", async () => {
    let resolve: (r: unknown) => void = () => {};
    env.wait.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result, rerender } = renderHook(() => useTransaction());
    let attempt: Promise<unknown> = Promise.resolve();
    act(() => {
      attempt = result.current.send(input).catch(() => {});
    });
    await waitFor(() => expect(result.current.state.phase).toBe("confirming"));
    env.account = {
      ...env.account,
      address: "0x3333333333333333333333333333333333333333",
    };
    rerender();
    await act(async () => {
      resolve(receipt());
      await attempt;
    });
    expect(result.current.state.phase).toBe("uncertain");
  });
});

it("receipt recovery never resubmits the write", async () => {
  env.wait.mockRejectedValueOnce(new Error("Receipt timeout"));
  const { result } = renderHook(() => useTransaction());
  await act(async () => {
    await expect(result.current.send(input)).rejects.toThrow("timeout");
  });
  expect(result.current.state.phase).toBe("uncertain");
  await act(async () => {
    expect(await result.current.recover()).toBe(true);
  });
  expect(result.current.state.phase).toBe("confirmed");
  expect(env.write).toHaveBeenCalledTimes(1);
});
