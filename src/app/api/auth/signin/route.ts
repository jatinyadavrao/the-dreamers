import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/session";
import { issueOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  if (!cleanEmail || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
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

  const token = await signSession({ userId: String(user._id), email: user.email, name: user.name });
  await setSessionCookie(token);

  return NextResponse.json({ email: user.email, name: user.name });
}
