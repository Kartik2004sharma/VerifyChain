import { verifyProduct } from "@/lib/server/chain";
import { body, guard, json, failure } from "@/lib/server/security";
export async function POST(request: Request) {
  try {
    await guard(request, "verify");
    const input = await body(request, 2000);
    const result = await verifyProduct(input.productId);
    return json(
      result,
      result.status === "invalid_input"
        ? 400
        : result.status === "unavailable"
          ? 503
          : 200,
    );
  } catch (e) {
    return failure(e);
  }
}
