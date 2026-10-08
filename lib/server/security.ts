import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { verifyMessage, isAddress } from "viem";
const memory = new Map<string, { count: number; until: number }>();
export async function quota(
  key: string,
  limit: number,
  seconds: number,
  once = false,
) {
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    if (new URL(url).protocol !== "https:")
      throw new Error("Invalid quota service");
    const script = once
      ? "if redis.call('SET',KEYS[1],'1','NX','EX',ARGV[1]) then return 1 else return 0 end"
      : "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        script,
        "1",
        `verifychain:${key}`,
        String(seconds),
      ]),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error("Quota unavailable");
    const v = await r.json();
    if (v.error || typeof v.result !== "number")
      throw new Error("Quota unavailable");
    return once ? v.result === 1 : v.result <= limit;
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("Production quota service missing");
  const now = Date.now();
  for (const [k, v] of memory) if (v.until < now) memory.delete(k);
  if (memory.size >= 1000 && !memory.has(key)) return false;
  const v = memory.get(key) ?? { count: 0, until: now + seconds * 1000 };
  v.count++;
  memory.set(key, v);
  return v.count <= (once ? 1 : limit);
}
export async function guard(request: Request, scope: string, limit = 30) {
  const identity =
    process.env.VERCEL === "1"
      ? (request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
        "global")
      : "global";
  if (!(await quota(`${scope}:${identity}`, limit, 60)))
    throw new Error("Rate limit exceeded");
}
export function originCheck(request: Request) {
  const origin = process.env.APP_ORIGIN;
  if (
    !origin ||
    new URL(origin).origin !== origin ||
    request.headers.get("origin") !== origin
  )
    throw new Error("Untrusted origin");
  return origin;
}
export async function body(request: Request, max = 16000) {
  if (!request.body) throw new Error("Missing JSON body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) {
      await reader.cancel();
      throw new Error("Request too large");
    }
    chunks.push(value);
  }
  const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a JSON object");
  return value;
}
function secret() {
  const s = process.env.UPLOAD_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("Upload authorization unavailable");
  return s;
}
function mac(data: string) {
  return createHmac("sha256", secret()).update(data).digest("hex");
}
export function challenge(address: string, origin: string) {
  if (!isAddress(address)) throw new Error("Invalid address");
  const payload = {
    address: address.toLowerCase(),
    origin,
    chainId: 11155111,
    nonce: randomBytes(24).toString("hex"),
    expires: Date.now() + 300000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${data}.${mac(data)}`;
  const message = `VerifyChain metadata upload\nOrigin: ${origin}\nChain: 11155111\nAddress: ${payload.address}\nNonce: ${payload.nonce}\nExpires: ${payload.expires}`;
  return { token, message };
}
export async function authorize(
  token: string,
  signature: `0x${string}`,
  origin: string,
) {
  if (
    token.length > 1500 ||
    !/^0x[0-9a-f]+$/i.test(signature) ||
    signature.length > 300
  )
    throw new Error("Invalid authorization");
  const [data, auth] = token.split(".");
  if (
    !data ||
    !auth ||
    !/^[0-9a-f]{64}$/.test(auth) ||
    !timingSafeEqual(Buffer.from(auth), Buffer.from(mac(data)))
  )
    throw new Error("Invalid challenge");
  const p = JSON.parse(Buffer.from(data, "base64url").toString());
  if (
    p.origin !== origin ||
    p.chainId !== 11155111 ||
    p.expires < Date.now() ||
    p.expires > Date.now() + 300000 ||
    !isAddress(p.address)
  )
    throw new Error("Expired or untrusted challenge");
  const message = `VerifyChain metadata upload\nOrigin: ${p.origin}\nChain: 11155111\nAddress: ${p.address}\nNonce: ${p.nonce}\nExpires: ${p.expires}`;
  if (!(await verifyMessage({ address: p.address, message, signature })))
    throw new Error("Invalid wallet signature");
  if (!(await quota(`nonce:${p.nonce}`, 1, 300, true)))
    throw new Error("Challenge already used");
  if (!(await quota(`upload:${p.address}`, 10, 3600)))
    throw new Error("Upload quota exceeded");
  return p.address as string;
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function failure(error: unknown) {
  const text = error instanceof Error ? error.message : "Invalid request";
  const limited = /limit|quota exceeded/.test(text);
  const unavailable = /unavailable|missing|Quota/.test(text);
  return json(
    {
      error: limited
        ? "Rate limit exceeded"
        : unavailable
          ? "Service unavailable"
          : text,
    },
    limited ? 429 : unavailable ? 503 : 400,
  );
}
