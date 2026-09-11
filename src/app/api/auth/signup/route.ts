import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { issueOtp } from "@/lib/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email: cleanEmail });

  if (existing && existing.emailVerified) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user =
    existing ??
    new User({ email: cleanEmail, passwordHash, name: (name ?? "").trim() });

  // Resuming an unverified account: refresh credentials.
  if (existing) {
    existing.passwordHash = passwordHash;
    if (name) existing.name = String(name).trim();
  }

  const result = await issueOtp(user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ needsVerification: true, email: user.email });
}
