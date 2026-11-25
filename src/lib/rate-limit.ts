import "server-only";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { RateLimit } from "@/models/RateLimit";

/**
 * Rate limits for every API route: fixed windows counted in MongoDB, so all server instances share
 * them. Anonymous routes count per IP (and per email where one is given); signed-in routes count per
 * account, so many students behind one campus IP never share a budget. Subjects are stored as keyed
 * hashes, never as raw IPs or emails, and the counters expire on their own.
 */
export type Rule = { name: string; limit: number; windowSec: number };

const MIN = 60;
export const RULES = {
  // sign-in: the per-email limit stops guessing one account's password; the per-IP one, spraying many
  signinEmail: { name: "signin-email", limit: 10, windowSec: 15 * MIN },
  signinIp: { name: "signin-ip", limit: 100, windowSec: 15 * MIN },
  signupIp: { name: "signup-ip", limit: 30, windowSec: 60 * MIN },
  // a 6-digit code: 10 tries per email per 10 minutes makes guessing it hopeless
  otpVerifyEmail: { name: "otp-verify-email", limit: 10, windowSec: 10 * MIN },
  otpVerifyIp: { name: "otp-verify-ip", limit: 100, windowSec: 10 * MIN },
  otpResendIp: { name: "otp-resend-ip", limit: 30, windowSec: 60 * MIN },
  googleIp: { name: "google-ip", limit: 120, windowSec: 10 * MIN },
  googleCallbackIp: { name: "google-callback-ip", limit: 120, windowSec: 10 * MIN },
  // signed in, per account
  search: { name: "search", limit: 90, windowSec: MIN },
  question: { name: "question", limit: 120, windowSec: MIN },
  progressRead: { name: "progress-read", limit: 60, windowSec: MIN },
  progressWrite: { name: "progress-write", limit: 120, windowSec: MIN },
  admin: { name: "admin", limit: 300, windowSec: MIN },
} satisfies Record<string, Rule>;

/** The caller's IP as Vercel reports it (it overwrites these headers, so clients cannot forge them there). */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const first = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "unknown";
}

function subjectKey(subject: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET || "rate-limit").update(subject).digest("base64url").slice(0, 24);
}

type Result = { ok: boolean; limit: number; remaining: number; retryAfter: number };

async function hit(rule: Rule, subject: string): Promise<Result> {
  const windowMs = rule.windowSec * 1000;
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  const resetAt = start + windowMs;
  try {
    await connectDB();
    const doc = await RateLimit.findOneAndUpdate(
      { _id: `${rule.name}:${subjectKey(subject)}:${start}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt + 60_000) } },
      { upsert: true, returnDocument: "after" }
    ).lean<{ count?: number }>();
    const count = doc?.count ?? 1;
    return {
      ok: count <= rule.limit,
      limit: rule.limit,
      remaining: Math.max(0, rule.limit - count),
      retryAfter: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
    };
  } catch {
    // if the counter store cannot be reached the request goes on: a limiter outage never locks people out
    return { ok: true, limit: rule.limit, remaining: rule.limit, retryAfter: 0 };
  }
}

function wait(seconds: number): string {
  if (seconds < 90) return `${seconds} seconds`;
  const m = Math.ceil(seconds / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

/**
 * Count this request against each [rule, subject]. Returns a 429 response when any limit is passed
 * (the caller returns it as is), or null to go on.
 */
export async function rateLimit(checks: [Rule, string][]): Promise<NextResponse | null> {
  const results = await Promise.all(checks.map(([rule, subject]) => hit(rule, subject)));
  const over = results.filter((r) => !r.ok).sort((a, b) => b.retryAfter - a.retryAfter)[0];
  if (!over) return null;
  return NextResponse.json(
    { error: `Too many requests. Please try again in ${wait(over.retryAfter)}.`, retryAfter: over.retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": String(over.retryAfter),
        "RateLimit-Limit": String(over.limit),
        "RateLimit-Remaining": "0",
        "Cache-Control": "no-store",
      },
    }
  );
}
