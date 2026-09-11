"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { CompanyLite } from "@/lib/data";
import { DIFFICULTIES } from "@/lib/utils";

const input =
  "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-dream-400";

type QRow = {
  _id: string;
  leetcodeId: number;
  title: string;
  difficulty: string;
  frequency: number;
  link: string;
};

export function QuestionsPanel({ companies }: { companies: CompanyLite[] }) {
  const [company, setCompany] = useState(companies[0]?.slug ?? "");
  const [rows, setRows] = useState<QRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ leetcodeId: "", title: "", difficulty: "Medium", frequency: "", link: "" });

  const load = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const res = await fetch(`/api/admin/questions?company=${company}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
    const data = res.ok ? await res.json() : [];
    setRows(data);
    setLoading(false);
  }, [company, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    if (!company || !form.leetcodeId || !form.title) return;
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company,
        timeframe: "alltime",
        leetcodeId: Number(form.leetcodeId),
        title: form.title,
        difficulty: form.difficulty,
        frequency: Number(form.frequency) || 0,
        link: form.link,
      }),
    });
    if (res.ok) {
      setForm({ leetcodeId: "", title: "", difficulty: "Medium", frequency: "", link: "" });
      load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
    if (res.ok) setRows((r) => r.filter((x) => x._id !== id));
  }

  async function patch(id: string, updates: Partial<QRow>) {
    await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={company} onChange={(e) => setCompany(e.target.value)} className={`${input} sm:w-64`}>
          {companies.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-[var(--background)]">{c.name}</option>
          ))}
        </select>
        <input className={`${input} flex-1`} placeholder="Search within company…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 font-display font-semibold">Add question</h3>
        <div className="grid gap-3 sm:grid-cols-6">
          <input className={input} placeholder="ID" value={form.leetcodeId} onChange={(e) => setForm({ ...form, leetcodeId: e.target.value })} />
          <input className={`${input} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className={input} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            {DIFFICULTIES.map((d) => <option key={d} className="bg-[var(--background)]">{d}</option>)}
          </select>
          <input className={input} placeholder="Freq" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
          <button onClick={add} className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-dream-500 to-nebula-500 px-3 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Add
          </button>
          <input className={`${input} sm:col-span-6`} placeholder="LeetCode link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
      </div>

      <div className="glass divide-y divide-[var(--border)] rounded-2xl">
        {loading && <p className="p-6 text-center text-sm text-[var(--muted)]">Loading…</p>}
        {!loading && rows.length === 0 && <p className="p-6 text-center text-sm text-[var(--muted)]">No questions.</p>}
        {rows.map((r) => (
          <div key={r._id} className="flex items-center gap-2 p-3">
            <span className="w-12 shrink-0 text-xs text-[var(--muted)]">{r.leetcodeId}</span>
            <input
              defaultValue={r.title}
              onBlur={(e) => e.target.value !== r.title && patch(r._id, { title: e.target.value })}
              className={`${input} flex-1`}
            />
            <select
              defaultValue={r.difficulty}
              onChange={(e) => patch(r._id, { difficulty: e.target.value })}
              className={`${input} hidden sm:block`}
            >
              {DIFFICULTIES.map((d) => <option key={d} className="bg-[var(--background)]">{d}</option>)}
            </select>
            {r.link && (
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-[var(--muted)] hover:text-dream-300">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button onClick={() => remove(r._id)} className="rounded-lg p-2 text-[var(--muted)] hover:text-red-400" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
