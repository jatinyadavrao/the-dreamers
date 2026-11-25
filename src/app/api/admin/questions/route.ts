import { NextResponse } from "next/server";
import { emailIsAdmin } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { RULES, rateLimit } from "@/lib/rate-limit";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { Company } from "@/models/Company";
import { escapeRegex, slugify } from "@/lib/utils";

async function guard() {
  const user = await getSession();
  if (!user || !emailIsAdmin(user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return rateLimit([[RULES.admin, user.userId]]);
}

async function recount(company: string) {
  const ids = await Question.distinct("leetcodeId", { company });
  await Company.updateOne({ slug: company }, { $set: { questionCount: ids.length } });
}

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  await connectDB();
  const sp = new URL(req.url).searchParams;
  const company = sp.get("company");
  const q = sp.get("q");
  const filter: Record<string, unknown> = {};
  if (company) filter.company = company;
  if (q) filter.title = { $regex: escapeRegex(q.slice(0, 80)), $options: "i" };
  const docs = await Question.find(filter).sort({ frequency: -1 }).limit(300).lean();
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = await req.json();
  if (!b.company || typeof b.leetcodeId !== "number" || !b.title) {
    return NextResponse.json({ error: "company, leetcodeId, title required" }, { status: 400 });
  }
  await connectDB();
  const doc = await Question.findOneAndUpdate(
    { company: b.company, timeframe: b.timeframe || "alltime", leetcodeId: b.leetcodeId },
    {
      $set: {
        title: b.title,
        slug: slugify(b.title),
        difficulty: b.difficulty || "Medium",
        acceptance: Number(b.acceptance) || 0,
        frequency: Number(b.frequency) || 0,
        link: b.link || "",
      },
    },
    { upsert: true, new: true }
  );
  await recount(b.company);
  return NextResponse.json(doc);
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await connectDB();
  if (updates.title) updates.slug = slugify(updates.title);
  await Question.updateOne({ _id: id }, { $set: updates });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await connectDB();
  const doc = await Question.findByIdAndDelete(id).lean<{ company?: string }>();
  if (doc?.company) await recount(doc.company);
  return NextResponse.json({ ok: true });
}
