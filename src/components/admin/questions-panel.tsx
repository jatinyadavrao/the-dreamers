"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { CompanyLite } from "@/lib/data";
import { DIFFICULTIES } from "@/lib/utils";

const input = "input input-sm";

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
  const [form, setForm] = useState({ leetcodeId: "", title: "", difficulty: "Medium", frequency: "", link: "" });

  const [reload, setReload] = useState(0);
  const key = `${company}|${q}|${reload}`;
  const [loadedKey, setLoadedKey] = useState("");
  const loading = !!company && loadedKey !== key;

  useEffect(() => {
    if (!company) return;
    const ctl = new AbortController();
    fetch(`/api/admin/questions?company=${company}${q ? `&q=${encodeURIComponent(q)}` : ""}`, { signal: ctl.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: QRow[]) => {
        setRows(data);
        setLoadedKey(key);
      })
      .catch(() => {});
    return () => ctl.abort();
  }, [company, q, key]);

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
      setReload((n) => n + 1);
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
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input className={`${input} flex-1`} placeholder="Search within company…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card p-5">
        <h3 className="mb-3 font-sans font-medium tracking-normal">Add question</h3>
        <div className="grid gap-3 sm:grid-cols-6">
          <input className={input} placeholder="ID" value={form.leetcodeId} onChange={(e) => setForm({ ...form, leetcodeId: e.target.value })} />
          <input className={`${input} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="select select-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input className={input} placeholder="Freq" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
          <button onClick={add} className="flex items-center justify-center gap-1 btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> Add
          </button>
          <input className={`${input} sm:col-span-6`} placeholder="LeetCode link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
      </div>

      <div className="card divide-y divide-line">
        {loading && <p className="p-6 text-center text-sm text-muted">Loading…</p>}
        {!loading && rows.length === 0 && <p className="p-6 text-center text-sm text-muted">No questions.</p>}
        {rows.map((r) => (
          <div key={r._id} className="flex items-center gap-2 p-3">
            <span className="w-12 shrink-0 text-xs text-muted">{r.leetcodeId}</span>
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
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
            {r.link && (
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="rounded-[4px] p-2 text-muted hover:text-ink">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button onClick={() => remove(r._id)} className="rounded-[4px] p-2 text-muted hover:text-danger" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
