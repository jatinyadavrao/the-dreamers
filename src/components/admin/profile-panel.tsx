"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check } from "lucide-react";
import type { ProfileLite } from "@/lib/data";

const input =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-dream-400";

const SOCIAL_KEYS = ["instagram", "youtube", "twitter", "github", "linkedin"] as const;

export function ProfilePanel({ initial }: { initial: ProfileLite }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="glass space-y-4 rounded-2xl p-6">
      <h3 className="font-display font-semibold">About Me</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className={input} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
        </Field>
        <Field label="Role / tagline">
          <input className={input} value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })} />
        </Field>
      </div>
      <Field label="Avatar URL">
        <input className={input} value={p.avatarUrl} onChange={(e) => setP({ ...p, avatarUrl: e.target.value })} />
      </Field>
      <Field label="Bio">
        <textarea rows={3} className={input} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        {SOCIAL_KEYS.map((k) => (
          <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
            <input
              className={input}
              placeholder={`https://…`}
              value={p.socials[k] ?? ""}
              onChange={(e) => setP({ ...p, socials: { ...p.socials, [k]: e.target.value } })}
            />
          </Field>
        ))}
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-dream-500 to-nebula-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
