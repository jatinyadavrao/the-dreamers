import "server-only";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "./mailer";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 60 * 1000; // 60s between sends
const WINDOW_MS = 10 * 60 * 1000; // rate-limit window
const MAX_PER_WINDOW = 3;

export type OtpResult = { ok: true } | { ok: false; error: string; status: number };

/**
 * Generate a fresh 6-digit code, store its hash on the user doc (with rate limiting),
 * and email it. Mutates and saves `user`.
 */
export async function issueOtp(user: {
  email: string;
  name?: string;
  otpHash?: string;
  otpExpires?: Date | null;
  otpSentAt?: Date | null;
  otpSendCount?: number;
  otpWindowStart?: Date | null;
  save: () => Promise<unknown>;
}): Promise<OtpResult> {
  const now = Date.now();

  // Cooldown between sends.
  if (user.otpSentAt && now - new Date(user.otpSentAt).getTime() < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - new Date(user.otpSentAt).getTime())) / 1000);
    return { ok: false, error: `Please wait ${wait}s before requesting another code.`, status: 429 };
  }

  // Sliding window cap.
  if (!user.otpWindowStart || now - new Date(user.otpWindowStart).getTime() > WINDOW_MS) {
    user.otpWindowStart = new Date(now);
    user.otpSendCount = 0;
  }
  if ((user.otpSendCount ?? 0) >= MAX_PER_WINDOW) {
    return { ok: false, error: "Too many codes requested. Try again in a few minutes.", status: 429 };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.otpHash = await bcrypt.hash(code, 10);
  user.otpExpires = new Date(now + OTP_TTL_MS);
  user.otpSentAt = new Date(now);
  user.otpSendCount = (user.otpSendCount ?? 0) + 1;
  await user.save();

  try {
    await sendOtpEmail(user.email, code, user.name);
  } catch {
    return { ok: false, error: "Couldn't send the email right now. Please try again.", status: 502 };
  }
  return { ok: true };
}

export async function checkOtp(
  user: { otpHash?: string; otpExpires?: Date | null },
  code: string
): Promise<boolean> {
  if (!user.otpHash || !user.otpExpires) return false;
  if (Date.now() > new Date(user.otpExpires).getTime()) return false;
  return bcrypt.compare(code, user.otpHash);
}
