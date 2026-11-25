import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { UserProgress } from "@/models/UserProgress";
import { Question } from "@/models/Question";
import { RULES, rateLimit } from "@/lib/rate-limit";

const ACTIONS = new Set(["solve", "unsolve", "bookmark", "unbookmark", "note"]);
const NOTE_MAX = 4000;

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : null);

export async function GET() {
  const session = await getSession();
  const userId = session?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const limited = await rateLimit([[RULES.progressRead, userId]]);
  if (limited) return limited;
  await connectDB();
  const docs = await UserProgress.find({ userId }).lean();
  return NextResponse.json(
    docs.map((d: Record<string, unknown>) => ({
      leetcodeId: d.leetcodeId,
      title: d.title,
      link: d.link,
      difficulty: d.difficulty,
      solved: Boolean(d.solved),
      bookmarked: Boolean(d.bookmarked),
      note: d.note ?? "",
      solvedAt: iso(d.solvedAt) ?? (d.solved ? iso(d.updatedAt) : null),
      updatedAt: iso(d.updatedAt),
    })),
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  const userId = session?.userId;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const limited = await rateLimit([[RULES.progressWrite, userId]]);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const { leetcodeId, action, note } = (body ?? {}) as { leetcodeId?: unknown; action?: unknown; note?: unknown };
  if (typeof leetcodeId !== "number" || !Number.isInteger(leetcodeId) || leetcodeId <= 0) {
    return NextResponse.json({ error: "leetcodeId required" }, { status: 400 });
  }
  if (typeof action !== "string" || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
  if (action === "note" && typeof note !== "string") {
    return NextResponse.json({ error: "note must be text" }, { status: 400 });
  }
  await connectDB();

  // the title, link and level come from the question itself, never from the request
  const [q, existing] = await Promise.all([
    Question.findOne({ leetcodeId }, { title: 1, link: 1, difficulty: 1 }).lean<{
      title?: string;
      link?: string;
      difficulty?: string;
    }>(),
    UserProgress.findOne({ userId, leetcodeId }, { solved: 1, solvedAt: 1, updatedAt: 1 }).lean<{
      solved?: boolean;
      solvedAt?: Date | null;
      updatedAt?: Date;
    }>(),
  ]);
  // a question an admin has since removed can still be unticked, unsaved or annotated, never added
  if (!q && (!existing || action === "solve" || action === "bookmark")) {
    return NextResponse.json({ error: "question not found" }, { status: 404 });
  }

  const set: Record<string, unknown> = q ? { title: q.title ?? "", link: q.link ?? "", difficulty: q.difficulty ?? "" } : {};
  // a solve from before solvedAt existed keeps its last known date, so later edits never move it
  if (existing?.solved && !existing.solvedAt && existing.updatedAt && action !== "unsolve") {
    set.solvedAt = existing.updatedAt;
  }
  if (action === "solve") {
    set.solved = true;
    // keep the first time it was solved when the same tick arrives twice
    if (!(existing?.solved && (existing.solvedAt || existing.updatedAt))) set.solvedAt = new Date();
  }
  if (action === "unsolve") {
    set.solved = false;
    set.solvedAt = null;
  }
  if (action === "bookmark") set.bookmarked = true;
  if (action === "unbookmark") set.bookmarked = false;
  if (action === "note") set.note = (note as string).slice(0, NOTE_MAX);

  const doc = await UserProgress.findOneAndUpdate(
    { userId, leetcodeId },
    { $set: set },
    { upsert: true, returnDocument: "after" }
  ).lean<Record<string, unknown>>();

  return NextResponse.json({
    leetcodeId: doc!.leetcodeId,
    solved: Boolean(doc!.solved),
    bookmarked: Boolean(doc!.bookmarked),
    note: doc!.note ?? "",
    solvedAt: iso(doc!.solvedAt),
  });
}
