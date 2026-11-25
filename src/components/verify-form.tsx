"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { safeNext } from "@/lib/utils";

export function VerifyForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const next = safeNext(sp.get("next"));

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
    <div>
      <h1 className="text-[clamp(32px,1.6vw+24px,44px)] leading-[1.05] tracking-[-0.035em]">Check your email</h1>
      <p className="mt-3 text-[16px] text-ink-soft">
        We sent a 6-digit code to <span className="font-medium text-ink">{email || "your email"}</span>. It expires in 10
        minutes.
      </p>

      <form onSubmit={verify} className="mt-8 grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-[14px] font-medium">Verification code</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="input h-14 text-center font-mono text-[26px] tracking-[0.5em]"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-[4px] border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3 py-2.5 text-[14px]">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-[14px] text-good">
            {info}
          </p>
        )}

        <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary h-12 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Verify and continue
        </button>
      </form>

      <button
        type="button"
        onClick={resend}
        disabled={cooldown > 0}
        className="mt-6 text-[14px] text-muted underline-offset-4 hover:text-ink hover:underline disabled:no-underline disabled:hover:text-muted"
      >
        {cooldown > 0 ? `Resend the code in ${cooldown}s` : "Didn't get it? Resend the code"}
      </button>
    </div>
  );
}
