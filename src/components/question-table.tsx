"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Bookmark,
  ExternalLink,
  Search,
  ArrowUpDown,
  Lock,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { DifficultyBadge } from "./difficulty-badge";
import { prettifyCompany, cn, type Difficulty } from "@/lib/utils";
import type { QuestionLite } from "@/lib/data";

type ProgressEntry = { solved: boolean; bookmarked: boolean };
type SortKey = "frequency" | "title" | "difficulty" | "acceptance";

const DIFF_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

export function QuestionTable({
  questions,
  showCompany = false,
}: {
  questions: QuestionLite[];
  showCompany?: boolean;
}) {
  const { isSignedIn } = useAuth();
  const [progress, setProgress] = useState<Record<number, ProgressEntry>>({});
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState<"all" | "solved" | "unsolved" | "bookmarked">("all");
  const [sortKey, setSortKey] = useState<SortKey>("frequency");
  const [asc, setAsc] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { leetcodeId: number; solved: boolean; bookmarked: boolean }[]) => {
        const map: Record<number, ProgressEntry> = {};
        for (const r of rows) map[r.leetcodeId] = { solved: r.solved, bookmarked: r.bookmarked };
        setProgress(map);
      })
      .catch(() => {});
  }, [isSignedIn]);

  async function toggle(
    row: QuestionLite,
    field: "solved" | "bookmarked"
  ) {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    const cur = progress[row.leetcodeId] ?? { solved: false, bookmarked: false };
    const next = { ...cur, [field]: !cur[field] };
    setProgress((p) => ({ ...p, [row.leetcodeId]: next }));
    const action =
      field === "solved"
        ? next.solved
          ? "solve"
          : "unsolve"
        : next.bookmarked
        ? "bookmark"
        : "unbookmark";
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leetcodeId: row.leetcodeId,
        title: row.title,
        link: row.link,
        difficulty: row.difficulty,
        action,
      }),
    }).catch(() => {});
  }

  const filtered = useMemo(() => {
    let list = questions.filter((row) => {
      if (q && !row.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (diff !== "all" && row.difficulty !== diff) return false;
      const p = progress[row.leetcodeId];
      if (status === "solved" && !p?.solved) return false;
      if (status === "unsolved" && p?.solved) return false;
      if (status === "bookmarked" && !p?.bookmarked) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "difficulty") cmp = DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return asc ? cmp : -cmp;
    });
    return list;
  }, [questions, q, diff, status, sortKey, asc, progress]);

  const solvedCount = Object.values(progress).filter((p) => p.solved).length;

  function setSort(key: SortKey) {
    if (key === sortKey) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(key === "title");
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-dream-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={diff} onChange={(v) => setDiff(v as typeof diff)} options={[["all", "All levels"], ["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"]]} />
          <Select value={status} onChange={(v) => setStatus(v as typeof status)} options={[["all", "All"], ["unsolved", "Unsolved"], ["solved", "Solved"], ["bookmarked", "Bookmarked"]]} />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>
          {filtered.length} question{filtered.length === 1 ? "" : "s"}
          {isSignedIn && ` · ${solvedCount} solved`}
        </span>
        {!isSignedIn && (
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Sign in to track progress
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:grid">
          <span>Done</span>
          <button onClick={() => setSort("title")} className="flex items-center gap-1 text-left hover:text-dream-300">
            Problem <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => setSort("difficulty")} className="flex items-center gap-1 hover:text-dream-300">
            Level <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => setSort("frequency")} className="flex items-center gap-1 hover:text-dream-300">
            Freq <ArrowUpDown className="h-3 w-3" />
          </button>
          <span className="text-right">Links</span>
        </div>

        <div className="max-h-[70vh] divide-y divide-[var(--border)] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filtered.map((row) => {
              const p = progress[row.leetcodeId];
              return (
                <motion.div
                  key={`${row.company}-${row.leetcodeId}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-dream-500/5 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4"
                >
                  <button
                    onClick={() => toggle(row, "solved")}
                    aria-label="Mark solved"
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md border transition-all",
                      p?.solved
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-[var(--border)] hover:border-green-500"
                    )}
                  >
                    {p?.solved && <Check className="h-4 w-4" />}
                  </button>

                  <div className="min-w-0">
                    <span className={cn("block truncate font-medium", p?.solved && "text-[var(--muted)] line-through")}>
                      <span className="mr-2 text-xs text-[var(--muted)]">{row.leetcodeId}.</span>
                      {row.title}
                    </span>
                    <div className="mt-1 flex items-center gap-2 sm:hidden">
                      <DifficultyBadge difficulty={row.difficulty} />
                      {showCompany && <span className="text-xs text-dream-300">{prettifyCompany(row.company)}</span>}
                    </div>
                  </div>

                  <span className="hidden sm:block">
                    <DifficultyBadge difficulty={row.difficulty} />
                  </span>

                  <span className="hidden text-sm text-[var(--muted)] sm:block">
                    {row.frequency.toFixed(1)}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggle(row, "bookmarked")}
                      aria-label="Bookmark"
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        p?.bookmarked ? "text-nebula-400" : "text-[var(--muted)] hover:text-nebula-400"
                      )}
                    >
                      <Bookmark className={cn("h-4 w-4", p?.bookmarked && "fill-current")} />
                    </button>
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:text-dream-300"
                      aria-label="Open on LeetCode"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              No questions match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-dream-400"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v} className="bg-[var(--background)]">
          {label}
        </option>
      ))}
    </select>
  );
}
