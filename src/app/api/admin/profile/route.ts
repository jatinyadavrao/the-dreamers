import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Profile } from "@/models/Profile";

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { name, role, bio, avatarUrl, socials } = await req.json();
  await connectDB();
  const set: Record<string, unknown> = {};
  if (name !== undefined) set.name = name;
  if (role !== undefined) set.role = role;
  if (bio !== undefined) set.bio = bio;
  if (avatarUrl !== undefined) set.avatarUrl = avatarUrl;
  if (socials !== undefined) set.socials = socials;
  const doc = await Profile.findOneAndUpdate(
    { key: "singleton" },
    { $set: set },
    { upsert: true, new: true }
  );
  return NextResponse.json(doc);
}
