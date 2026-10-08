import { json } from "@/lib/server/security";
export async function GET() {
  return json({ live: true });
}
