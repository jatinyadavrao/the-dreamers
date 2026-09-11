"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Check, ExternalLink, Trophy, Target, StickyNote } from "lucide-react";
import { useAuth } from "./auth-provider";
import { DifficultyBadge } from "./difficulty-badge";
import { cn } from "@/lib/utils";

type Row = {
  leetcodeId: number;
  title: string;
  link: string;
  difficulty: string;
  solved: boolean;
  bookmarked: boolean;
  note: string;
};

export function DashboardClient() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookmarks" | "solved" | "notes">("bookmarks");

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Row[]) => setRows(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function post(row: Row, action: string, note?: string) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leetcodeId: row.leetcodeId, title: row.title, link: row.link, difficulty: row.difficulty, action, note }),
    }).catch(() => {});
  }

  function toggleSolved(row: Row) {
    const next = !row.solved;
    setRows((rs) => rs.map((r) => (r.leetcodeId === row.leetcodeId ? { ...r, solved: next } : r)));
    post(row, next ? "solve" : "unsolve");
  }
  function toggleBookmark(row: Row) {
    const next = !row.bookmarked;
    setRows((rs) => rs.map((r) => (r.leetcodeId === row.leetcodeId ? { ...r, bookmarked: next } : r)));
    post(row, next ? "bookmark" : "unbookmark");
  }
  function saveNote(row: Row, note: string) {
    setRows((rs) => rs.map((r) => (r.leetcodeId === row.leetcodeId ? { ...r, note } : r)));
    post(row, "note", note);
  }

  const solved = rows.filter((r) => r.solved);
  const bookmarks = rows.filter((r) => r.bookmarked);
  const notes = rows.filter((r) => r.note?.trim());
  const byDiff = (list: Row[], d: string) => list.filter((r) => r.difficulty === d).length;

  const stats = [
    { icon: Trophy, label: "Solved", value: solved.length, color: "from-green-500/20 to-emerald-500/20 text-green-400" },
    { icon: Bookmark, label: "Bookmarked", value: bookmarks.length, color: "from-nebula-500/20 to-pink-500/20 text-nebula-400" },
    { icon: Target, label: "In revision", value: notes.length, color: "from-dream-500/20 to-indigo-500/20 text-dream-300" },
  ];

  const tabs = [
    { key: "bookmarks" as const, label: `Revision list (${bookmarks.length})`, list: bookmarks },
    { key: "solved" as const, label: `Solved (${solved.length})`, list: solved },
    { key: "notes" as const, label: `Notes (${notes.length})`, list: notes },
  ];
  const activeList = tabs.find((t) => t.key === tab)!.list;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        Welcome back{firstName ? `, ${firstName}` : ""} 👋
      </h1>
      <p className="mt-2 text-[var(--muted)]">Here&apos;s your progress across every company.</p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl bg-gradient-to-br p-5 ${s.color}`}
          >
            <s.icon className="h-6 w-6" />
            <div className="mt-3 font-display text-3xl font-bold text-[var(--foreground)]">{s.value}</div>
            <div className="text-xs text-[var(--muted)]">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {solved.length > 0 && (
        <div className="glass mt-4 flex items-center gap-4 rounded-2xl p-4 text-sm">
          <span className="font-medium">Breakdown:</span>
          <span className="text-green-400">{byDiff(solved, "Easy")} Easy</span>
          <span className="text-amber-400">{byDiff(solved, "Medium")} Medium</span>
          <span className="text-red-400">{byDiff(solved, "Hard")} Hard</span>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-dream-400 bg-dream-500/15 text-dream-300"
                : "border-[var(--border)] text-[var(--muted)] hover:border-dream-400/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <p className="text-[var(--muted)]">Loading…</p>}
        {!loading && activeList.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-[var(--muted)]">
            Nothing here yet. Start solving and bookmarking questions!
          </div>
        )}
        {activeList.map((row) => (
          <div key={row.leetcodeId} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <a href={row.link} target="_blank" rel="noopener noreferrer" className="block truncate font-medium hover:text-dream-300">
                  <span className="mr-1.5 text-xs text-[var(--muted)]">{row.leetcodeId}.</span>
                  {row.title}
                </a>
                <div className="mt-1"><DifficultyBadge difficulty={row.difficulty} /></div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => toggleSolved(row)} aria-label="solved" className={cn("rounded-lg p-2", row.solved ? "text-green-400" : "text-[var(--muted)] hover:text-green-400")}>
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => toggleBookmark(row)} aria-label="bookmark" className={cn("rounded-lg p-2", row.bookmarked ? "text-nebula-400" : "text-[var(--muted)] hover:text-nebula-400")}>
                  <Bookmark className={cn("h-4 w-4", row.bookmarked && "fill-current")} />
                </button>
                <a href={row.link} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-[var(--muted)] hover:text-dream-300">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            {tab === "notes" || row.note ? (
              <div className="mt-3 flex items-start gap-2">
                <StickyNote className="mt-2 h-4 w-4 shrink-0 text-[var(--muted)]" />
                <textarea
                  defaultValue={row.note}
                  onBlur={(e) => e.target.value !== row.note && saveNote(row, e.target.value)}
                  placeholder="Add a note / approach…"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-dream-400"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
