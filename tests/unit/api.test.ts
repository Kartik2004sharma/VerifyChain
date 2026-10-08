import { it, expect, vi, afterEach } from "vitest";
const boundary = vi.hoisted(() => ({ verify: vi.fn() }));
vi.mock("@/lib/server/chain", () => ({ verifyProduct: boundary.verify }));
import { POST } from "@/app/api/blockchain/verify/route";
import { GET as live } from "@/app/api/health/live/route";
afterEach(() => vi.clearAllMocks());
it("API separates 400 input, 503 outage and successful public reads V04 V09", async () => {
  for (const [status, code] of [
    ["invalid_input", 400],
    ["unavailable", 503],
    ["not_found", 200],
    ["revoked", 200],
    ["registered", 200],
  ]) {
    boundary.verify.mockResolvedValue({
      status,
      productId: "VC-001",
      chainId: 11155111,
    });
    const response = await POST(
      new Request("http://localhost/api/blockchain/verify", {
        method: "POST",
        body: JSON.stringify({ productId: "VC-001" }),
      }),
    );
    expect(response.status).toBe(code);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).status).toBe(status);
  }
});
it("malformed/null JSON never yields a fabricated verdict", async () => {
  for (const body of ["{bad", "null", "[]"]) {
    const response = await POST(
      new Request("http://localhost", { method: "POST", body }),
    );
    expect(response.status).toBe(400);
    expect(boundary.verify).not.toHaveBeenCalled();
  }
});
it("liveness is independent from a missing live chain", async () => {
  const response = await live();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ live: true });
});
