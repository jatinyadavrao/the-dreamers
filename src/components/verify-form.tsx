"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, MailCheck, Loader2 } from "lucide-react";

export function VerifyForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const next = sp.get("next") || "/companies";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }).catch(() => null);
    setBusy(false);
    if (!res) return setError("Network error. Please try again.");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error || "Invalid code.");
    }
    router.push(next);
    router.refresh();
  }

  async function resend() {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    if (res && res.ok) {
      setInfo("A new code is on its way.");
      setCooldown(60);
    } else {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error || "Couldn't resend right now.");
      setCooldown(60);
    }
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-dream-400" />
          <span className="font-display text-lg font-bold text-gradient">The Dreamers</span>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-dream-500/20 to-nebula-500/20 p-3 text-dream-300">
            <MailCheck className="h-7 w-7" />
          </div>
        </div>

        <h1 className="text-center font-display text-2xl font-bold">Verify your email</h1>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">
          We sent a 6-digit code to <span className="text-dream-300">{email}</span>
        </p>

        <form onSubmit={verify} className="mt-6 space-y-4">
          <input
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••••"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-dream-400"
          />

          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          {info && <p className="text-center text-sm text-green-400">{info}</p>}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-dream-500 to-nebula-500 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify
          </button>
        </form>

        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="mt-5 w-full text-center text-sm text-[var(--muted)] hover:text-dream-300 disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get it? Resend code"}
        </button>
      </motion.div>
    </section>
  );
}
