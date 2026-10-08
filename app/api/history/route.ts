import { history } from "@/lib/server/chain";
import { guard, json, failure } from "@/lib/server/security";
import { productIdSchema } from "@/lib/domain/metadata";
export async function GET(request: Request) {
  const parsed = productIdSchema.safeParse(
    new URL(request.url).searchParams.get("id"),
  );
  if (!parsed.success) return json({ error: "Invalid product ID" }, 400);
  try {
    await guard(request, "history");
  } catch (e) {
    return failure(e);
  }
  try {
    const result = await history(parsed.data);
    return json(
      JSON.parse(
        JSON.stringify(result, (_, v) =>
          typeof v === "bigint" ? String(v) : v,
        ),
      ),
    );
  } catch {
    return json({ error: "Record service unavailable" }, 503);
  }
}
