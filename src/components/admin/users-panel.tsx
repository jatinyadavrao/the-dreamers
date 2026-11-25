"use client";

import { useState, useSyncExternalStore } from "react";
import { Search, BadgeCheck, Clock } from "lucide-react";
import type { UserRow } from "@/lib/data";

const input = "input input-sm";

const noop = () => () => {};

// times are shown in the admin's own zone and locale, so they are written after hydration
function fmt(iso: string | null, client: boolean) {
  if (!iso) return "—";
  if (!client) return iso.slice(0, 10);
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function UsersPanel({ users }: { users: UserRow[] }) {
  const [q, setQ] = useState("");
  const client = useSyncExternalStore(noop, () => true, () => false);
  const filtered = users.filter(
    (u) => u.email.toLowerCase().includes(q.toLowerCase()) || u.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or name…"
          className={`${input} w-full pl-10`}
        />
      </div>

      <p className="text-xs text-muted">{filtered.length} of {users.length} users</p>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1.5fr_1fr_auto_1fr_1fr] gap-4 border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>Email</span><span>Name</span><span>Method</span><span>Joined</span><span>Last login</span>
        </div>
        <div className="max-h-[65vh] divide-y divide-line overflow-y-auto">
          {filtered.map((u) => (
            <div key={u.email} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[1.5fr_1fr_auto_1fr_1fr] sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5 truncate font-medium">
                {u.email}
                {u.emailVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-good" />}
              </span>
              <span className="truncate text-sm text-muted">{u.name || "—"}</span>
              <span className={`chip w-fit ${u.provider === "google" ? "chip-ink" : ""}`}>
                {u.provider === "google" ? "Google" : "Email"}
              </span>
              <span className="text-xs text-muted">{fmt(u.createdAt, client)}</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3 w-3 sm:hidden" />{fmt(u.lastLoginAt, client)}
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No users found.</p>}
        </div>
      </div>
    </div>
  );
}
