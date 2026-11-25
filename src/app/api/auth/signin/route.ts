import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/session";
import { issueOtp } from "@/lib/otp";
import { RULES, clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email, password } = ((await req.json().catch(() => null)) ?? {}) as { email?: unknown; password?: unknown };
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  const limited = await rateLimit([
    [RULES.signinIp, clientIp(req)],
    ...(cleanEmail ? ([[RULES.signinEmail, cleanEmail]] as [typeof RULES.signinEmail, string][]) : []),
  ]);
  if (limited) return limited;

  if (!cleanEmail || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (cleanEmail.length > 254 || password.length > 200) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: cleanEmail });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Unverified: send a fresh code and ask them to verify.
  if (!user.emailVerified) {
    await issueOtp(user).catch(() => {});
    return NextResponse.json(
      { needsVerification: true, email: user.email, error: "Please verify your email." },
      { status: 403 }
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = await signSession({ userId: String(user._id), email: user.email, name: user.name });
  await setSessionCookie(token);

  return NextResponse.json({ email: user.email, name: user.name });
}
