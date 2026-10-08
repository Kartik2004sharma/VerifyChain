import {
  body,
  challenge,
  originCheck,
  guard,
  json,
  failure,
} from "@/lib/server/security";
export async function POST(request: Request) {
  try {
    const origin = originCheck(request);
    await guard(request, "challenge", 10);
    const input = await body(request, 1000);
    return json(challenge(input.address, origin));
  } catch (e) {
    return failure(e);
  }
}
