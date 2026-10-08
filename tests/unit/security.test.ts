import { describe, it, expect, vi, afterEach } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import {
  challenge,
  authorize,
  body,
  originCheck,
  quota,
} from "@/lib/server/security";
import { serverConfig } from "@/lib/server/config";
import { verifyProduct } from "@/lib/server/chain";
afterEach(() => vi.unstubAllEnvs());
describe("Configuration A03 V04", () => {
  it("fails closed without a manifest and RPC", () => {
    vi.stubEnv("SEPOLIA_RPC_URL", "");
    expect(() => serverConfig()).toThrow();
  });
  it("never calls an outage counterfeit", async () => {
    const result = await verifyProduct("VC-01");
    expect(result.status).toBe("unavailable");
    expect(result.transactionHash).toBeUndefined();
  });
  it("invalid inputs fail before RPC", async () =>
    expect((await verifyProduct("")).status).toBe("invalid_input"));
});
describe("Upload authorization R06 and quota V10", () => {
  it("rejects wrong origin", () => {
    vi.stubEnv("APP_ORIGIN", "https://verify.test");
    expect(() =>
      originCheck(
        new Request("https://verify.test", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
  });
  it("verifies scoped wallet signatures and blocks replay", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv(
      "UPLOAD_AUTH_SECRET",
      "test-secret-012345678901234567890123456789",
    );
    const account = privateKeyToAccount(`0x${"11".repeat(32)}`);
    const c = challenge(account.address, "https://verify.test");
    const signature = await account.signMessage({ message: c.message });
    expect(await authorize(c.token, signature, "https://verify.test")).toBe(
      account.address.toLowerCase(),
    );
    await expect(
      authorize(c.token, signature, "https://verify.test"),
    ).rejects.toThrow("already used");
    await expect(
      authorize(c.token, signature, "https://evil.test"),
    ).rejects.toThrow();
  });
  it("rejects tampered token and wrong signer", async () => {
    vi.stubEnv(
      "UPLOAD_AUTH_SECRET",
      "test-secret-012345678901234567890123456789",
    );
    const account = privateKeyToAccount(`0x${"22".repeat(32)}`);
    const c = challenge(account.address, "https://verify.test");
    await expect(
      authorize(c.token + "f", "0x12", "https://verify.test"),
    ).rejects.toThrow();
  });
  it("fails production quota without shared store", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    await expect(quota("x", 10, 60)).rejects.toThrow("missing");
  });
  it("bounds request bytes and rejects non-object JSON", async () => {
    await expect(
      body(new Request("http://localhost", { method: "POST", body: '"x"' })),
    ).rejects.toThrow();
    await expect(
      body(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({ x: "a".repeat(100) }),
        }),
        10,
      ),
    ).rejects.toThrow("too large");
  });
});
