import { products } from "@/lib/server/chain";
import { guard, json, failure } from "@/lib/server/security";
import { isAddress } from "viem";
export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner");
  if (!owner || !isAddress(owner)) return json({ error: "Invalid owner" }, 400);
  try {
    await guard(request, "products");
  } catch (e) {
    return failure(e);
  }
  try {
    return json(await products(owner));
  } catch {
    return json({ error: "Record service unavailable" }, 503);
  }
}
