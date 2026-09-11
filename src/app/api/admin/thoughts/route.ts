import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Thought } from "@/models/Thought";

async function guard() {
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { text, category, author, isFeatured } = await req.json();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  await connectDB();
  if (isFeatured) await Thought.updateMany({}, { $set: { isFeatured: false } });
  const doc = await Thought.create({
    text,
    category: category || "Motivation",
    author: author || "The Dreamer",
    isFeatured: Boolean(isFeatured),
  });
  return NextResponse.json(doc);
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { id, isFeatured, text, category } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await connectDB();
  if (isFeatured) await Thought.updateMany({}, { $set: { isFeatured: false } });
  const set: Record<string, unknown> = {};
  if (text !== undefined) set.text = text;
  if (category !== undefined) set.category = category;
  if (isFeatured !== undefined) set.isFeatured = Boolean(isFeatured);
  await Thought.updateOne({ _id: id }, { $set: set });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await connectDB();
  await Thought.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
