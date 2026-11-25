"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Bookmark, Check, ExternalLink, StickyNote } from "lucide-react";
import { useAuth } from "./auth-provider";
import { DifficultyBadge } from "./difficulty-badge";
import { EmptyState, StatTile } from "@/components/ui/kit";
import { countByDay, dayKey, streaks } from "@/lib/streak";
import { cn, DIFFICULTIES, DIFFICULTY_VARS } from "@/lib/utils";

type Row = {
  leetcodeId: number;
  title: string;
  link: string;
  difficulty: string;
  solved: boolean;
  bookmarked: boolean;
  note: string;
  solvedAt: string | null;
  updatedAt: string | null;
};

export type Coverage = { slug: string; name: string; solved: number; total: number }[];

const WEEKS = 40;
const noop = () => () => {};

export function DashboardClient({ coverage }: { coverage: Coverage }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookmarks" | "solved" | "notes">("bookmarks");

  useEffect(() => {
    fetch("/api/progress", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Row[]) => setRows(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function post(row: Row, action: string, note?: string) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leetcodeId: row.leetcodeId, action, note }),
    }).catch(() => {});
  }

  function toggleSolved(row: Row) {
    const next = !row.solved;
    setRows((rs) =>
      rs.map((r) => (r.leetcodeId === row.leetcodeId ? { ...r, solved: next, solvedAt: next ? new Date().toISOString() : null } : r))
    );
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
  const byDay = useMemo(() => countByDay(solved.map((r) => r.solvedAt)), [solved]);
  const s = useMemo(() => streaks(byDay), [byDay]);
  const week = useMemo(() => {
    const now = new Date();
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      n += byDay.get(dayKey(d)) ?? 0;
    }
    return n;
  }, [byDay]);
  const split = DIFFICULTIES.map((d) => ({ d, n: solved.filter((r) => r.difficulty === d).length }));

  const tabs = [
    { key: "bookmarks" as const, label: "Revision list", list: bookmarks },
    { key: "solved" as const, label: "Solved", list: [...solved].sort((a, b) => (b.solvedAt ?? "").localeCompare(a.solvedAt ?? "")) },
    { key: "notes" as const, label: "Notes", list: notes },
  ];
  const activeList = tabs.find((t) => t.key === tab)!.list;

  return (
    <div className="pb-24">
      <div className="page-in grid gap-3 pt-10 pb-8 lg:pt-14 lg:pb-10">
        <h1 className="text-[clamp(36px,2.6vw+24px,56px)] leading-[1.04] tracking-[-0.04em]">
          {firstName ? `Welcome back, ${firstName}` : "Your dashboard"}
        </h1>
        <p className="t-lead text-ink-soft">Your progress across every company.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Solved" value={loading ? "–" : solved.length}>
          {solved.length > 0 && (
            <div className="mt-2 grid gap-2">
              <div className="flex h-2 gap-[2px]" role="img" aria-label={split.map((p) => `${p.d} ${p.n}`).join(", ")}>
                {split
                  .filter((p) => p.n > 0)
                  .map((p) => (
                    <span key={p.d} className="rounded-full" style={{ flexGrow: p.n, flexBasis: 0, background: DIFFICULTY_VARS[p.d] }} />
                  ))}
              </div>
              <div className="flex flex-wrap gap-x-3 text-[12px] text-muted">
                {split.map((p) => (
                  <span key={p.d} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: DIFFICULTY_VARS[p.d] }} aria-hidden />
                    {p.d} {p.n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </StatTile>
        <StatTile
          label="Current streak"
          value={loading ? "–" : `${s.current} ${s.current === 1 ? "day" : "days"}`}
          sub={
            loading
              ? undefined
              : s.current > 0 && !s.today
                ? "Solve one today to keep it going"
                : `Longest: ${s.longest} ${s.longest === 1 ? "day" : "days"}`
          }
        />
        <StatTile label="This week" value={loading ? "–" : week} sub="Solved in the last 7 days" />
        <StatTile label="Revision list" value={loading ? "–" : bookmarks.length} sub={`${notes.length} with notes`} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <section className="card p-5 sm:p-6 lg:col-span-8" aria-labelledby="activity-h">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="activity-h" className="font-sans text-[15px] font-medium tracking-normal">
              Activity
            </h2>
            <span className="text-[13px] text-muted">Questions solved per day, last {WEEKS} weeks</span>
          </div>
          <Heatmap byDay={byDay} />
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-4" aria-labelledby="coverage-h">
          <div className="mb-5 flex items-baseline justify-between gap-2">
            <h2 id="coverage-h" className="font-sans text-[15px] font-medium tracking-normal">
              Where you have solved most
            </h2>
          </div>
          {coverage.length === 0 ? (
            <p className="text-[14px] text-muted">
              Tick questions off on any{" "}
              <Link href="/companies" className="link">
                company list
              </Link>{" "}
              and your coverage shows here.
            </p>
          ) : (
            <ul className="grid gap-3.5">
              {coverage.map((c) => (
                <li key={c.slug} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <Link href={`/companies/${c.slug}`} className="truncate hover:underline hover:underline-offset-4">
                      {c.name}
                    </Link>
                    <span className="tnum flex-none text-[13px] text-muted">
                      {c.solved} of {c.total}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)]" aria-hidden>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(2, (c.solved / Math.max(1, c.total)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-12 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="tabs" role="tablist" aria-label="Your lists">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className="tab">
              {t.label}
              <span className="count">{t.list.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" className="grid grid-cols-1 gap-2">
        {loading && (
          <div className="grid gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="skel h-[68px] w-full rounded-[8px]" />
            ))}
          </div>
        )}
        {!loading && activeList.length === 0 && (
          <EmptyState
            title={tab === "bookmarks" ? "Your revision list is empty" : tab === "solved" ? "Nothing solved yet" : "No notes yet"}
            body={
              tab === "bookmarks"
                ? "Save tricky questions from any list with the bookmark, and they collect here."
                : tab === "solved"
                  ? "Tick a question off on any company list and it shows here."
                  : "Write the approach for a question in your revision list, and it stays here."
            }
            action={
              <Link href="/companies" className="btn btn-primary btn-sm">
                Find your company
              </Link>
            }
          />
        )}
        {activeList.map((row) => (
          <div key={row.leetcodeId} className="card px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <a
                  href={row.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-[15px] font-medium hover:underline hover:underline-offset-4"
                >
                  <span className="mr-2 font-mono text-[12px] font-normal text-muted">{row.leetcodeId}</span>
                  {row.title}
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] text-muted">
                  <DifficultyBadge difficulty={row.difficulty} />
                  {row.solved && row.solvedAt && <span>Solved {new Date(row.solvedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleSolved(row)}
                  aria-pressed={row.solved}
                  aria-label={row.solved ? `Mark ${row.title} as not solved` : `Mark ${row.title} as solved`}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-[4px] transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]",
                    row.solved ? "text-good" : "text-muted hover:text-ink"
                  )}
                >
                  <Check className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(row)}
                  aria-pressed={row.bookmarked}
                  aria-label={row.bookmarked ? `Remove ${row.title} from your revision list` : `Save ${row.title} for revision`}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-[4px] transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]",
                    row.bookmarked ? "text-accent-text" : "text-muted hover:text-ink"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", row.bookmarked && "fill-current")} aria-hidden />
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
            </div>
            {tab === "notes" || tab === "bookmarks" || row.note ? (
              <label className="mt-3 flex items-start gap-2.5">
                <StickyNote className="mt-2.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="sr-only">Note for {row.title}</span>
                <textarea
                  defaultValue={row.note}
                  onBlur={(e) => e.target.value !== row.note && saveNote(row, e.target.value)}
                  placeholder="Write the approach, the trick, or where you got stuck"
                  rows={2}
                  className="textarea text-[14px]"
                />
              </label>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One cell per day, one hue light to dark. One tab stop: arrow keys move between days. */
function Heatmap({ byDay }: { byDay: Map<string, number> }) {
  // days and month names belong to the visitor's own clock and locale: draw after mount
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return <div className="h-[158px]" aria-hidden />;
  return <HeatmapGrid byDay={byDay} />;
}

function HeatmapGrid({ byDay }: { byDay: Map<string, number> }) {
  const grid = useRef<HTMLDivElement>(null);
  const days = useMemo(() => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // start on the Monday WEEKS-1 weeks before this week's Monday
    const dow = (end.getDay() + 6) % 7;
    const start = new Date(end);
    start.setDate(end.getDate() - dow - (WEEKS - 1) * 7);
    const out: { date: Date; key: string; n: number; future: boolean }[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dayKey(d);
      out.push({ date: d, key, n: byDay.get(key) ?? 0, future: d > end });
    }
    return out;
  }, [byDay]);
  const todayIndex = days.findIndex((d) => d.key === dayKey(new Date()));
  const [active, setActive] = useState<number | null>(null);
  const level = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);
  const months: { col: number; label: string }[] = [];
  days.forEach((d, i) => {
    if (i % 7 === 0) {
      const prev = months[months.length - 1];
      const label = d.date.toLocaleDateString(undefined, { month: "short" });
      if (!prev || prev.label !== label) months.push({ col: i / 7, label });
    }
  });
  // a month whose first column sits too close to the next month's has no room for its name
  const labelled = months.filter((m, i) => i === months.length - 1 || months[i + 1].col - m.col >= 3);
  const total = days.reduce((a, d) => a + d.n, 0);
  const activeDays = days.filter((d) => d.n > 0);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const onKey = (e: React.KeyboardEvent) => {
    const cur = active ?? todayIndex;
    const step: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    if (step[e.key] == null) return;
    e.preventDefault();
    const next = Math.min(todayIndex, Math.max(0, cur + step[e.key]));
    setActive(next);
  };

  const a = active != null ? days[active] : null;

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid min-w-max grid-cols-[28px_auto] gap-x-2 gap-y-1.5">
          <span />
          <div className="grid h-4 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 14px)` }} aria-hidden>
            {Array.from({ length: WEEKS }).map((_, c) => (
              <span key={c} className="text-[11px] leading-4 whitespace-nowrap text-muted">
                {labelled.find((m) => m.col === c)?.label ?? ""}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-7 gap-[3px] text-[11px] text-muted" aria-hidden>
            {["Mon", "", "Wed", "", "Fri", "", ""].map((l, i) => (
              <span key={i} className="h-[14px] leading-[14px]">
                {l}
              </span>
            ))}
          </div>
          <div
            ref={grid}
            tabIndex={0}
            role="img"
            aria-label={`${total} questions solved on ${activeDays.length} days in the last ${WEEKS} weeks. Use the arrow keys to read each day.`}
            onKeyDown={onKey}
            onFocus={() => setActive((x) => x ?? todayIndex)}
            onBlur={() => setActive(null)}
            onMouseLeave={() => setActive(null)}
            className="grid grid-flow-col grid-rows-7 gap-[3px] rounded-[2px]"
            style={{ gridTemplateColumns: `repeat(${WEEKS}, 14px)` }}
          >
            {days.map((d, i) => (
              <span
                key={d.key}
                onMouseEnter={() => !d.future && setActive(i)}
                className={cn("h-[14px] w-[14px] rounded-[3px]", active === i && "ring-2 ring-ink ring-offset-1 ring-offset-surface")}
                style={{ background: d.future ? "transparent" : `var(--heat-${level(d.n)})` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted">
        <span aria-live="polite" className="min-h-[1lh] text-ink-soft">
          {a ? (
            <>
              <strong className="font-semibold text-ink">{a.n}</strong> solved · {fmt(a.date)}
            </>
          ) : (
            `${total} solved in the last ${WEEKS} weeks`
          )}
        </span>
        <span className="inline-flex items-center gap-1.5">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: `var(--heat-${l})` }} aria-hidden />
          ))}
          More
        </span>
      </div>
      {activeDays.length > 0 && (
        <details className="mt-3 text-[13px]">
          <summary className="cursor-pointer text-muted hover:text-ink">Show as a list</summary>
          <table className="mt-2 w-full max-w-sm text-left">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-normal">Day</th>
                <th className="py-1 text-right font-normal">Solved</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {[...activeDays].reverse().map((d) => (
                <tr key={d.key} className="border-t border-line">
                  <td className="py-1">{fmt(d.date)}</td>
                  <td className="py-1 text-right">{d.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
