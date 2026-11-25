import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { issueOtp } from "@/lib/otp";
import { RULES, clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email } = ((await req.json().catch(() => null)) ?? {}) as { email?: unknown };
  const cleanEmail = String(email ?? "").trim().toLowerCase();

  // each account already has its own cooldown; this caps one sender emailing many addresses
  const limited = await rateLimit([[RULES.otpResendIp, clientIp(req)]]);
  if (limited) return limited;

  if (!cleanEmail || cleanEmail.length > 254) return NextResponse.json({ error: "Email required." }, { status: 400 });

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
