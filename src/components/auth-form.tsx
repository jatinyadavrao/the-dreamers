"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { safeNext } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const sp = useSearchParams();
  // only a path on this site: never bounce a visitor to another origin after sign-in
  const next = safeNext(sp.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(() => {
    const e = sp.get("error");
    if (!e) return "";
    if (e === "rate_limited") return "Too many sign-in attempts from your network. Please try again in a few minutes.";
    return "Google sign-in failed. Please try again.";
  });
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === "sign-up";
  const googleHref = `/api/auth/google?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(`/api/auth/${mode === "sign-in" ? "signin" : "signup"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isSignUp ? { email, password, name } : { email, password }),
    }).catch(() => null);
    setBusy(false);

    if (!res) return setError("Network error. Please try again.");
    const data = await res.json().catch(() => ({}));

    // Unverified account (from sign-in): go verify.
    if (res.status === 403 && data.needsVerification) {
      return router.push(`/verify?email=${encodeURIComponent(data.email || email)}&next=${encodeURIComponent(next)}`);
    }
    if (!res.ok) {
      return setError(data.error || "Something went wrong.");
    }
    // Sign-up: needs email verification.
    if (data.needsVerification) {
      return router.push(`/verify?email=${encodeURIComponent(data.email || email)}&next=${encodeURIComponent(next)}`);
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-[clamp(32px,1.6vw+24px,44px)] leading-[1.05] tracking-[-0.035em]">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-3 text-[16px] text-ink-soft">
        {isSignUp ? "Free forever. Your ticks, revision list and notes stay with your account." : "Pick up your lists where you left them."}
      </p>

      <a href={googleHref} className="btn btn-secondary mt-8 h-12 w-full gap-3">
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="my-6 flex items-center gap-3 text-[13px] text-muted">
        <span className="h-px flex-1 bg-line" />
        or with your email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="grid gap-4" noValidate={false}>
        {isSignUp && (
          <Field label="Name" hint="Optional">
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="input" />
          </Field>
        )}
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="input"
          />
        </Field>
        <Field label="Password" hint={isSignUp ? "At least 6 characters" : undefined}>
          <input
            type="password"
            required
            minLength={isSignUp ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="input"
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-[4px] border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2.5 text-[14px] text-ink">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary mt-2 h-12 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-muted">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={`/sign-in${next !== "/companies" ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={`/sign-up${next !== "/companies" ? `?next=${encodeURIComponent(next)}` : ""}`} className="link">
              Create an account
            </Link>
          </>
        )}
      </p>
      <p className="mt-8 text-[13px] text-muted">
        By continuing you agree to the{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
          Terms
        </Link>{" "}
        and the{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-baseline justify-between text-[14px] font-medium">
        {label}
        {hint && <span className="text-[13px] font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.5 35.7 45 30.3 45 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
