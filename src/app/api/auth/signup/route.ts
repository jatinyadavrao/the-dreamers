import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { issueOtp } from "@/lib/otp";
import { RULES, clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, password, name } = ((await req.json().catch(() => null)) ?? {}) as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  const limited = await rateLimit([[RULES.signupIp, clientIp(req)]]);
  if (limited) return limited;

  if (cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password must be at most 200 characters." }, { status: 400 });
  }
  if (name != null && (typeof name !== "string" || name.length > 80)) {
    return NextResponse.json({ error: "Name must be at most 80 characters." }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email: cleanEmail });

  if (existing && existing.emailVerified) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user =
    existing ??
    new User({ email: cleanEmail, passwordHash, name: ((name as string | undefined) ?? "").trim() });

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
