import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { Question } from "@/models/Question";
import { slugify } from "@/lib/utils";

async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { name, slug, logoUrl } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  await connectDB();
  const finalSlug = slugify(slug || name);
  const count = await Company.countDocuments({});
  const doc = await Company.findOneAndUpdate(
    { slug: finalSlug },
    { $set: { name, logoUrl: logoUrl ?? "" }, $setOnInsert: { order: count } },
    { upsert: true, new: true }
  );
  return NextResponse.json(doc);
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { slug, name, logoUrl } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  await connectDB();
  const set: Record<string, unknown> = {};
  if (name !== undefined) set.name = name;
  if (logoUrl !== undefined) set.logoUrl = logoUrl;
  await Company.updateOne({ slug }, { $set: set });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  await connectDB();
  await Promise.all([Company.deleteOne({ slug }), Question.deleteMany({ company: slug })]);
  return NextResponse.json({ ok: true });
}
