"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/companies";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === "sign-up";

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

    // Unverified account (from sign-in) → go verify.
    if (res.status === 403 && data.needsVerification) {
      return router.push(`/verify?email=${encodeURIComponent(data.email || email)}&next=${encodeURIComponent(next)}`);
    }
    if (!res.ok) {
      return setError(data.error || "Something went wrong.");
    }
    // Sign-up → needs email verification.
    if (data.needsVerification) {
      return router.push(`/verify?email=${encodeURIComponent(data.email || email)}&next=${encodeURIComponent(next)}`);
    }
    // Signed in.
    router.push(next);
    router.refresh();
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-dream-400" />
          <span className="font-display text-lg font-bold text-gradient">The Dreamers</span>
        </Link>

        <h1 className="text-center font-display text-2xl font-bold">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">
          {isSignUp ? "Start tracking your dream-company prep." : "Sign in to continue."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isSignUp && (
            <Field icon={UserIcon}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full bg-transparent outline-none"
              />
            </Field>
          )}
          <Field icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent outline-none"
            />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-dream-500 to-nebula-500 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="text-dream-300 hover:underline">Sign in</Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/sign-up" className="text-dream-300 hover:underline">Create an account</Link>
            </>
          )}
        </p>
      </motion.div>
    </section>
  );
}

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 focus-within:border-dream-400">
      <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      {children}
    </div>
  );
}
