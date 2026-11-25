"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Bookmark, Check, ExternalLink, Lock, Search, Shuffle } from "lucide-react";
import { useAuth } from "./auth-provider";
import { DifficultyBadge } from "./difficulty-badge";
import { useProgress, useToggleProgress } from "@/lib/progress-store";
import { cn, companyLabel, type Difficulty } from "@/lib/utils";
import type { QuestionLite } from "@/lib/data";

type Row = QuestionLite & { companyCount?: number };
type SortKey = "frequency" | "title" | "difficulty" | "acceptance" | "companies";
type Status = "all" | "unsolved" | "solved" | "bookmarked";

const DIFF_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
const PAGE = 80;

/**
 * A list of questions: search, level and status filters, sorting, ticks and the revision list.
 * mode "company" links each title to LeetCode; mode "explore" opens it in the question drawer and
 * shows how many companies ask it.
 */
export function QuestionTable({
  questions,
  showCompany = false,
  mode = "company",
  onOpen,
  openId,
  emptyHint,
}: {
  questions: Row[];
  showCompany?: boolean;
  mode?: "company" | "explore";
  onOpen?: (row: Row) => void;
  openId?: number | null;
  emptyHint?: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const progress = useProgress(isSignedIn);
  const toggle = useToggleProgress();
  const explore = mode === "explore";
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState<Status>("all");
  const [sortKey, setSortKey] = useState<SortKey>(explore ? "companies" : "frequency");
  const [asc, setAsc] = useState(false);
  const filterKey = JSON.stringify([q, diff, status, sortKey, asc]);
  const [shown, setShown] = useState({ key: filterKey, n: PAGE });
  // a new filter starts the list from its top
  const limit = shown.key === filterKey ? shown.n : PAGE;
  const sentinel = useRef<HTMLDivElement>(null);

  const maxFreq = useMemo(() => Math.max(0.0001, ...questions.map((r) => r.frequency)), [questions]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const byId = /^\d+$/.test(term) ? Number(term) : null;
    const list = questions.filter((row) => {
      if (term && !(row.title.toLowerCase().includes(term) || row.leetcodeId === byId)) return false;
      if (diff !== "all" && row.difficulty !== diff) return false;
      const p = progress[row.leetcodeId];
      if (status === "solved" && !p?.solved) return false;
      if (status === "unsolved" && p?.solved) return false;
      if (status === "bookmarked" && !p?.bookmarked) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "difficulty") cmp = DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      else if (sortKey === "companies") cmp = (a.companyCount ?? 0) - (b.companyCount ?? 0) || a.frequency - b.frequency;
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return asc ? cmp : -cmp;
    });
  }, [questions, q, diff, status, sortKey, asc, progress]);

  // render rows as they come into view, so an 800-row list stays quick
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setShown((s) => ({ key: filterKey, n: (s.key === filterKey ? s.n : PAGE) + PAGE }));
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, limit, filterKey]);

  const solvedHere = useMemo(() => questions.filter((r) => progress[r.leetcodeId]?.solved).length, [questions, progress]);

  function setSort(key: SortKey) {
    if (key === sortKey) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(key === "title");
    }
  }

  function randomUnsolved() {
    const pool = filtered.filter((r) => !progress[r.leetcodeId]?.solved && r.link);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (explore && onOpen) onOpen(pick);
    else window.open(pick.link, "_blank", "noopener,noreferrer");
  }

  const cols = explore
    ? "@3xl:grid-cols-[28px_minmax(0,1fr)_96px_88px_96px_72px] @5xl:grid-cols-[28px_minmax(0,1fr)_96px_96px_132px_104px_72px]"
    : "@3xl:grid-cols-[28px_minmax(0,1fr)_96px_88px_72px] @5xl:grid-cols-[28px_minmax(0,1fr)_96px_96px_148px_72px]";

  const sortHead = (key: SortKey, label: string, className?: string) => (
    <button
      type="button"
      onClick={() => setSort(key)}
      aria-pressed={sortKey === key}
      aria-label={`Sort by ${label.toLowerCase()}${sortKey === key ? (asc ? ", ascending" : ", descending") : ""}`}
      className={cn("inline-flex items-center gap-1 text-left hover:text-ink", sortKey === key && "text-ink", className)}
    >
      {label}
      {sortKey === key && (asc ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />)}
    </button>
  );

  return (
    <div className="@container">
      {/* toolbar */}
      <div className="mb-4 grid gap-3 @4xl:flex @4xl:items-center">
        <label className="field @4xl:w-[300px] @6xl:w-[340px]">
          <Search aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or number"
            aria-label="Search questions"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-[13px] text-muted hover:text-ink">
              Clear
            </button>
          )}
        </label>
        <div className="tabs" role="tablist" aria-label="Difficulty">
          {(["all", "Easy", "Medium", "Hard"] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={diff === d}
              onClick={() => setDiff(d)}
              className="tab"
            >
              {d === "all" ? "All levels" : d}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 @4xl:ml-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            aria-label="Filter by status"
            className="select select-sm w-[150px]"
          >
            <option value="all">Every status</option>
            <option value="unsolved">To do</option>
            <option value="solved">Solved</option>
            <option value="bookmarked">Revision list</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => {
              const k = e.target.value as SortKey;
              setSortKey(k);
              setAsc(k === "title");
            }}
            aria-label="Sort by"
            className="select select-sm w-[170px]"
          >
            {explore && <option value="companies">Most companies</option>}
            <option value="frequency">Most frequent</option>
            <option value="acceptance">Acceptance</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title</option>
          </select>
          <button type="button" onClick={randomUnsolved} className="btn btn-secondary btn-sm" disabled={!filtered.length}>
            <Shuffle className="h-4 w-4" aria-hidden />
            Random unsolved
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
        <span aria-live="polite">
          {filtered.length.toLocaleString("en-US")} {filtered.length === 1 ? "question" : "questions"}
          {isSignedIn && ` · ${solvedHere} solved`}
        </span>
        {!isSignedIn && (
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Sign in to tick questions off and keep a revision list
          </span>
        )}
      </div>

      <div className="card [overflow:clip]">
        {/* column heads */}
        <div
          className={cn(
            "sticky top-[var(--nav)] z-10 hidden items-center gap-4 border-b border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-muted @3xl:grid",
            cols
          )}
        >
          <span>
            <span className="sr-only">Solved</span>
          </span>
          {sortHead("title", "Question")}
          {sortHead("difficulty", "Level")}
          {sortHead("acceptance", "Accepted")}
          {sortHead("frequency", "Frequency", "hidden @5xl:inline-flex")}
          {explore && sortHead("companies", "Companies")}
          <span className="text-right">
            <span className="sr-only">Actions</span>
          </span>
        </div>

        <ul className="divide-y divide-line">
          {filtered.slice(0, limit).map((row) => {
            const p = progress[row.leetcodeId];
            const open = openId === row.leetcodeId;
            return (
              <li
                key={`${row.company}-${row.leetcodeId}`}
                className={cn(
                  "group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors @3xl:gap-4 @3xl:py-2.5",
                  cols,
                  open ? "bg-[color-mix(in_oklab,var(--ink)_6%,transparent)]" : "hover:bg-[color-mix(in_oklab,var(--ink)_3.5%,transparent)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(row, "solved")}
                  aria-label={p?.solved ? `Mark ${row.title} as not solved` : `Mark ${row.title} as solved`}
                  aria-pressed={!!p?.solved}
                  className={cn(
                    "grid h-[22px] w-[22px] place-items-center rounded-full transition-[background-color,box-shadow,transform] duration-200 active:scale-90",
                    p?.solved
                      ? "bg-ink text-bg"
                      : "shadow-[inset_0_0_0_1.5px_var(--line-strong)] hover:shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--ink)_45%,transparent)]"
                  )}
                >
                  {p?.solved && <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />}
                </button>

                <div className="min-w-0">
                  {explore ? (
                    <button
                      type="button"
                      onClick={() => onOpen?.(row)}
                      className={cn(
                        "block max-w-full truncate text-left text-[15px] font-medium hover:underline hover:decoration-line-strong hover:underline-offset-4",
                        p?.solved && "text-muted"
                      )}
                    >
                      <span className="mr-2 font-mono text-[12px] font-normal text-muted">{row.leetcodeId}</span>
                      {row.title}
                    </button>
                  ) : (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "block truncate text-[15px] font-medium hover:underline hover:decoration-line-strong hover:underline-offset-4",
                        p?.solved && "text-muted"
                      )}
                    >
                      <span className="mr-2 font-mono text-[12px] font-normal text-muted">{row.leetcodeId}</span>
                      {row.title}
                    </a>
                  )}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted @3xl:hidden">
                    <DifficultyBadge difficulty={row.difficulty} />
                    {row.acceptance > 0 && <span>{row.acceptance.toFixed(1)}% accepted</span>}
                    {explore && row.companyCount != null && <span>{row.companyCount} companies</span>}
                    {showCompany && !explore && <span>{companyLabel(undefined, row.company)}</span>}
                  </div>
                </div>

                <span className="hidden @3xl:block">
                  <DifficultyBadge difficulty={row.difficulty} />
                </span>
                <span className="tnum hidden text-[14px] text-ink-soft @3xl:block">
                  {row.acceptance > 0 ? `${row.acceptance.toFixed(1)}%` : "—"}
                </span>
                <span className="hidden items-center gap-2.5 @5xl:flex" title={`Frequency ${row.frequency.toFixed(2)}`}>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_9%,transparent)]">
                    <span
                      className="block h-full rounded-full bg-[color-mix(in_oklab,var(--ink)_55%,var(--surface))]"
                      style={{ width: `${Math.max(3, (row.frequency / maxFreq) * 100)}%` }}
                    />
                  </span>
                  <span className="tnum w-8 text-right font-mono text-[12px] text-muted">{row.frequency.toFixed(1)}</span>
                </span>
                {explore && (
                  <span className="tnum hidden text-[14px] text-ink-soft @3xl:block">{row.companyCount ?? "—"}</span>
                )}

                <div className="col-start-3 row-start-1 flex items-center justify-end gap-0.5 @3xl:col-start-auto @3xl:row-start-auto">
                  <button
                    type="button"
                    onClick={() => toggle(row, "bookmarked")}
                    aria-label={p?.bookmarked ? `Remove ${row.title} from your revision list` : `Save ${row.title} for revision`}
                    aria-pressed={!!p?.bookmarked}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-[4px] transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]",
                      p?.bookmarked ? "text-accent-text" : "text-muted hover:text-ink"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", p?.bookmarked && "fill-current")} aria-hidden />
                  </button>
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${row.title} on LeetCode`}
                    className="grid h-9 w-9 place-items-center rounded-[4px] text-muted transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:text-ink"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
        {filtered.length > limit && <div ref={sentinel} className="h-12" aria-hidden />}
        {filtered.length === 0 && (
          <div className="px-4 py-14 text-center text-[15px] text-muted">
            {emptyHint ?? "No questions match these filters."}
          </div>
        )}
      </div>
    </div>
  );
}
