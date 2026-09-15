"use client";

import { useState } from "react";
import { Search, BadgeCheck, Clock } from "lucide-react";
import type { UserRow } from "@/lib/data";

const input =
  "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-dream-400";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function UsersPanel({ users }: { users: UserRow[] }) {
  const [q, setQ] = useState("");
  const filtered = users.filter(
    (u) => u.email.toLowerCase().includes(q.toLowerCase()) || u.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or name…"
          className={`${input} w-full pl-10`}
        />
      </div>

      <p className="text-xs text-[var(--muted)]">{filtered.length} of {users.length} users</p>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[1.5fr_1fr_auto_1fr_1fr] gap-4 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:grid">
          <span>Email</span><span>Name</span><span>Method</span><span>Joined</span><span>Last login</span>
        </div>
        <div className="max-h-[65vh] divide-y divide-[var(--border)] overflow-y-auto">
          {filtered.map((u) => (
            <div key={u.email} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[1.5fr_1fr_auto_1fr_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 truncate font-medium">
                {u.email}
                {u.emailVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-green-400" />}
              </span>
              <span className="truncate text-sm text-[var(--muted)]">{u.name || "—"}</span>
              <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${u.provider === "google" ? "bg-blue-500/15 text-blue-400" : "bg-dream-500/15 text-dream-300"}`}>
                {u.provider === "google" ? "Google" : "Email"}
              </span>
              <span className="text-xs text-[var(--muted)]">{fmt(u.createdAt)}</span>
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Clock className="h-3 w-3 sm:hidden" />{fmt(u.lastLoginAt)}
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-4 py-10 text-center text-sm text-[var(--muted)]">No users found.</p>}
        </div>
      </div>
    </div>
  );
}
