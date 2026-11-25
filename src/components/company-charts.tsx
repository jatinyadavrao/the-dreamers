"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { useProgress } from "@/lib/progress-store";
import { DIFFICULTIES, DIFFICULTY_VARS, type Difficulty } from "@/lib/utils";
import type { QuestionLite } from "@/lib/data";

/**
 * A company's list at a glance: how it splits by level (one tall segmented bar), the questions it asks
 * most (ranked bars, the top one in the accent), and, signed in, how much of it you have solved.
 */
export function CompanyCharts({ questions }: { questions: QuestionLite[] }) {
  const { isSignedIn } = useAuth();
  const progress = useProgress(isSignedIn);
  const total = questions.length;
  const split = DIFFICULTIES.map((d) => ({ d, n: questions.filter((q) => q.difficulty === d).length }));
  const top = [...questions].sort((a, b) => b.frequency - a.frequency).slice(0, 6);
  const max = Math.max(0.0001, ...top.map((q) => q.frequency));
  const solved = questions.filter((q) => progress[q.leetcodeId]?.solved);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
      <section className="card grid content-start gap-5 p-5 lg:col-span-5 lg:p-6" aria-labelledby="split-h">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="split-h" className="font-sans text-[15px] font-medium tracking-normal">
            By level
          </h2>
          <span className="text-[13px] text-muted">{total.toLocaleString("en-US")} questions</span>
        </div>
        <SegmentedBar parts={split} total={total} />
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          {split.map((p) => (
            <li key={p.d} className="inline-flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: DIFFICULTY_VARS[p.d] }} aria-hidden />
              {p.d}
              <span className="tnum text-muted">{p.n}</span>
            </li>
          ))}
        </ul>
        {isSignedIn && total > 0 && (
          <div className="grid gap-2 border-t border-line pt-4">
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-ink-soft">Solved here</span>
              <span className="tnum text-muted">
                {solved.length} of {total} · {Math.round((solved.length / total) * 100)}%
              </span>
            </div>
            <div
              role="meter"
              aria-label={`Solved ${solved.length} of ${total}`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={solved.length}
              className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)]"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${(solved.length / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="card grid content-start gap-4 p-5 lg:col-span-7 lg:p-6" aria-labelledby="top-h">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="top-h" className="font-sans text-[15px] font-medium tracking-normal">
            Asked most often
          </h2>
          <span className="text-[13px] text-muted">LeetCode frequency score</span>
        </div>
        <ol className="grid gap-2.5">
          {top.map((q, i) => (
            <li key={q.leetcodeId} className="grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-[14px] max-sm:grid-cols-[minmax(0,1fr)_5rem_2.25rem]">
              <a href={q.link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:underline-offset-4">
                {q.title}
              </a>
              <span className="h-2 overflow-hidden rounded-r-[4px]" aria-hidden>
                <span
                  className="block h-full rounded-r-[4px]"
                  style={{
                    width: `${Math.max(4, (q.frequency / max) * 100)}%`,
                    background: i === 0 ? "var(--accent)" : "color-mix(in oklab, var(--ink) 45%, var(--surface))",
                  }}
                />
              </span>
              <span className="tnum text-right font-mono text-[12px] text-muted">{q.frequency.toFixed(1)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** One whole split into its levels: 28px, 4px corners, a 2px surface gap, its share printed where it fits. */
function SegmentedBar({ parts, total }: { parts: { d: Difficulty; n: number }[]; total: number }) {
  const [hover, setHover] = useState<Difficulty | null>(null);
  const shown = parts.filter((p) => p.n > 0);
  return (
    <div className="relative">
      <div
        role="img"
        aria-label={shown.map((p) => `${p.d} ${p.n} (${Math.round((p.n / total) * 100)}%)`).join(", ")}
        className="flex h-7 gap-[2px]"
      >
        {shown.map((p) => {
          const share = p.n / total;
          return (
            <span
              key={p.d}
              tabIndex={0}
              onMouseEnter={() => setHover(p.d)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.d)}
              onBlur={() => setHover(null)}
              className="relative flex min-w-[3px] items-center overflow-visible rounded-[4px] px-2 outline-offset-2 transition-[filter] hover:brightness-110"
              style={{ flexGrow: p.n, flexBasis: 0, background: DIFFICULTY_VARS[p.d] }}
            >
              {share >= 0.12 && (
                <span className="text-[12px] font-semibold" style={{ color: `var(--on-${p.d.toLowerCase()})` }}>
                  {Math.round(share * 100)}%
                </span>
              )}
              {hover === p.d && (
                <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 rounded-[4px] border border-line bg-bg px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-[0_6px_16px_-6px_rgb(0_0_0/0.4)]">
                  <strong className="font-semibold">{p.n}</strong> <span className="text-muted">{p.d.toLowerCase()} · {Math.round(share * 100)}%</span>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
