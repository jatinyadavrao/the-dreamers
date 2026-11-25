import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { quickSearch } from "@/lib/data";
import { RULES, rateLimit } from "@/lib/rate-limit";

/** The command palette's search. Signed-in users only, like the lists themselves. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const limited = await rateLimit([[RULES.search, session.userId]]);
  if (limited) return limited;
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const result = await quickSearch(q).catch(() => ({ companies: [], questions: [] }));
  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
