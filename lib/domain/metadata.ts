import { keccak256, toHex } from "viem";
import { z } from "zod";
export const byteString = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .refine(
      (v) => new TextEncoder().encode(v).length <= max,
      `Must be at most ${max} UTF-8 bytes`,
    );
export const productIdSchema = byteString(100).refine(
  (v) => !/[\u0000-\u001f\u007f]/.test(v),
  "Control characters are not allowed",
);
export const metadataSchema = z
  .object({
    schema: z.literal("verifychain.product.v1"),
    productId: productIdSchema,
    name: byteString(200),
    description: z.string().trim().max(2000),
    category: byteString(100),
    serial: byteString(100),
    origin: byteString(200),
  })
  .strict();
export type ProductMetadata = z.infer<typeof metadataSchema>;
// Fixed field order, normalized strings and no whitespace; hash covers exact UTF-8 bytes.
export function canonicalMetadata(input: unknown) {
  const m = metadataSchema.parse(input);
  return JSON.stringify({
    schema: m.schema,
    productId: m.productId,
    name: m.name,
    description: m.description,
    category: m.category,
    serial: m.serial,
    origin: m.origin,
  });
}
export function metadataHash(input: unknown) {
  return keccak256(toHex(canonicalMetadata(input)));
}
export function parseQR(payload: string, origin: string) {
  const url = new URL(payload);
  if (
    url.origin !== origin ||
    !["/verify", "/dashboard/verify-product"].includes(url.pathname) ||
    url.username ||
    url.password ||
    !["http:", "https:"].includes(url.protocol)
  )
    throw new Error("Scan a VerifyChain label from this website.");
  return productIdSchema.parse(url.searchParams.get("id"));
}
export function csvCell(value: unknown) {
  const s = String(value ?? "");
  return (
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
  );
}

export function qrLabel(svg: string, id: string) {
  const escaped = productIdSchema
    .parse(id)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="410" viewBox="0 0 340 410"><rect width="340" height="410" fill="white"/>${svg.replace("<svg ", '<svg x="30" y="20" ')}<text x="170" y="332" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#101714">VerifyChain product passport</text><text x="170" y="356" text-anchor="middle" textLength="290" lengthAdjust="spacingAndGlyphs" font-family="monospace" font-size="11" fill="#101714">${escaped}</text><text x="170" y="386" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#235B46">Ethereum Sepolia testnet</text></svg>`;
}

export function inspectMetadata(
  value: unknown,
  hash: string,
  id: string,
  name: string,
) {
  const parsed = metadataSchema.safeParse(value);
  if (!parsed.success) return { integrity: "mismatch" as const };
  const metadata = parsed.data;
  return {
    metadata,
    integrity:
      metadataHash(metadata) === hash &&
      metadata.productId === id &&
      metadata.name === name
        ? ("match" as const)
        : ("mismatch" as const),
  };
}
