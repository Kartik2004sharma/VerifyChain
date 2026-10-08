import {
  body,
  authorize,
  originCheck,
  guard,
  json,
  failure,
} from "@/lib/server/security";
import { canonicalMetadata, metadataHash } from "@/lib/domain/metadata";
export async function POST(request: Request) {
  try {
    const origin = originCheck(request);
    await guard(request, "upload", 10);
    const input = await body(request);
    const bytes = canonicalMetadata(input.metadata);
    await authorize(input.token, input.signature, origin);
    const jwt = process.env.PINATA_JWT;
    if (!jwt) return json({ error: "Storage is not configured" }, 503);
    const r = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: JSON.parse(bytes),
        pinataMetadata: { name: `VerifyChain ${input.metadata.productId}` },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      return json(
        { error: "Storage upload failed; no transaction was sent." },
        502,
      );
    const data = await r.json();
    if (!/^[a-zA-Z0-9]{46,100}$/.test(data.IpfsHash))
      return json({ error: "Storage returned an invalid CID" }, 502);
    return json({
      uri: `ipfs://${data.IpfsHash}`,
      hash: metadataHash(input.metadata),
      canonical: bytes,
    });
  } catch (e) {
    return failure(e);
  }
}
