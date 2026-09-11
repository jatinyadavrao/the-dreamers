import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { checkOtp } from "@/lib/otp";
import { signSession, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const { email, code } = await req.json();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanCode = String(code ?? "").trim();

  if (!cleanEmail || !/^\d{6}$/.test(cleanCode)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (user.emailVerified) {
    // Already verified — just log them in.
    const token = await signSession({ userId: String(user._id), email: user.email, name: user.name });
    await setSessionCookie(token);
    return NextResponse.json({ email: user.email, name: user.name });
  }

  const valid = await checkOtp(user, cleanCode);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  user.emailVerified = true;
  user.otpHash = "";
  user.otpExpires = null;
  await user.save();

  const token = await signSession({ userId: String(user._id), email: user.email, name: user.name });
  await setSessionCookie(token);

  return NextResponse.json({ email: user.email, name: user.name });
}
