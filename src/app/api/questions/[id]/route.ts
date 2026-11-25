import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getQuestionDetail } from "@/lib/data";
import { RULES, rateLimit } from "@/lib/rate-limit";

/** Which companies ask one problem, and how often. Signed-in users only, like the lists themselves. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/questions/[id]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const limited = await rateLimit([[RULES.question, session.userId]]);
  if (limited) return limited;
  const { id } = await ctx.params;
  const leetcodeId = Number(id);
  if (!Number.isInteger(leetcodeId) || leetcodeId <= 0 || leetcodeId > 100000) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const detail = await getQuestionDetail(leetcodeId).catch(() => null);
  if (!detail) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(detail, { headers: { "Cache-Control": "private, max-age=300" } });
}
