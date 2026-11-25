import { NextResponse } from "next/server";
import { emailIsAdmin } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { RULES, rateLimit } from "@/lib/rate-limit";
import { connectDB } from "@/lib/db";
import { Profile } from "@/models/Profile";

export async function PATCH(req: Request) {
  const user = await getSession();
  if (!user || !emailIsAdmin(user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const limited = await rateLimit([[RULES.admin, user.userId]]);
  if (limited) return limited;
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
