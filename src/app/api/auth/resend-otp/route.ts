import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { issueOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const { email } = await req.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!cleanEmail) return NextResponse.json({ error: "Email required." }, { status: 400 });

  await connectDB();
  const user = await User.findOne({ email: cleanEmail });

  // Don't reveal whether the account exists / is verified.
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const result = await issueOtp(user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
