import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { UserProgress } from "@/models/UserProgress";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
    }))
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { leetcodeId, title, link, difficulty, action, note } = body ?? {};
  if (typeof leetcodeId !== "number") {
    return NextResponse.json({ error: "leetcodeId required" }, { status: 400 });
  }
  await connectDB();

  const set: Record<string, unknown> = { title, link, difficulty };
  if (action === "solve") set.solved = true;
  if (action === "unsolve") set.solved = false;
  if (action === "bookmark") set.bookmarked = true;
  if (action === "unbookmark") set.bookmarked = false;
  if (action === "note") set.note = String(note ?? "");

  const doc = await UserProgress.findOneAndUpdate(
    { userId, leetcodeId },
    { $set: set },
    { upsert: true, new: true }
  ).lean<Record<string, unknown>>();

  return NextResponse.json({
    leetcodeId: doc!.leetcodeId,
    solved: Boolean(doc!.solved),
    bookmarked: Boolean(doc!.bookmarked),
    note: doc!.note ?? "",
  });
}
