import { ready } from "@/lib/server/chain";
import { json, guard } from "@/lib/server/security";
export async function GET(request: Request) {
  try {
    await guard(request, "ready", 10);
    await ready();
    return json({ ready: true, chainId: 11155111 });
  } catch {
    return json(
      {
        ready: false,
        reason:
          "Validated manifest, Sepolia RPC and quota service are required.",
      },
      503,
    );
  }
}
