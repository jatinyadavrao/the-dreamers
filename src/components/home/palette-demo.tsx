"use client";

import { useMemo, useRef } from "react";
import { useTicker } from "@/components/fx/use-ticker";
import type { HomeShowcase } from "@/lib/data";

const DIFF: Record<string, string> = { Easy: "var(--easy)", Medium: "var(--medium)", Hard: "var(--hard)" };
type Step = { phase: "type" | "list" | "move" | "press" | "clear"; k: number; at: number; ms: number };

/** The command palette at work: a few letters, the matches across companies and questions, Enter. */
export function PaletteDemo({ palette }: { palette: NonNullable<HomeShowcase["palette"]> }) {
  const ref = useRef<HTMLDivElement>(null);
  const q = palette.query;
  const rows = [
    ...palette.companies.slice(0, 1).map((c) => ({ key: `c-${c.name}`, label: c.name, meta: `${c.questionCount} questions`, kind: "company" as const })),
    ...palette.questions.slice(0, 3).map((x) => ({
      key: `q-${x.leetcodeId}`,
      label: `${x.leetcodeId}. ${x.title}`,
      meta: `${x.companyCount} companies`,
      kind: "question" as const,
      difficulty: x.difficulty,
    })),
  ];
  const target = Math.min(2, rows.length - 1);

  const timeline = useMemo(() => {
    const t: Step[] = [];
    for (let k = 1; k <= q.length; k++) t.push({ phase: "type", k, at: -1, ms: 140 });
    t.push({ phase: "list", k: q.length, at: 0, ms: 600 });
    for (let i = 1; i <= target; i++) t.push({ phase: "move", k: q.length, at: i, ms: 520 });
    t.push({ phase: "press", k: q.length, at: target, ms: 380 });
    t.push({ phase: "move", k: q.length, at: target, ms: 1600 });
    t.push({ phase: "clear", k: 0, at: -1, ms: 500 });
    // the first frame is the list with the pick highlighted
    const at = t.findIndex((x) => x.phase === "move" && x.at === target);
    return at > 0 ? [...t.slice(at), ...t.slice(0, at)] : t;
  }, [q, target]);

  const { tick } = useTicker(ref, (n) => timeline[n % timeline.length].ms);
  const step = timeline[tick % timeline.length];
  const typed = q.slice(0, step.k);
  const listed = step.phase !== "type" && step.phase !== "clear";

  return (
    <div ref={ref} className="panel" style={{ ["--p-h" as string]: "336px" }}>
      <div
        className="stage grid place-items-center px-6 py-8"
        role="img"
        aria-label={`The Dreamers search palette finding companies and questions for "${q}"`}
      >
        <div className="ui ui-panel pd" aria-hidden="true">
          <div className="pd__input">
            <svg className="ui-icon" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" />
            </svg>
            <span>
              {typed || <span style={{ color: "var(--u-soft)" }}>Search companies and questions</span>}
              {!listed && <span className="caret" />}
            </span>
            <span className="ui-spacer" />
            <span className="ui-kbd">⌘K</span>
          </div>
          <div style={{ minHeight: 48 + rows.length * 36 }}>
            {listed &&
              (["company", "question"] as const).map((kind) => {
                const group = rows.map((r, i) => ({ r, i })).filter((x) => x.r.kind === kind);
                if (!group.length) return null;
                return (
                  <div key={kind}>
                    <div className="pd__group">{kind === "company" ? "Companies" : "Questions"}</div>
                    {group.map(({ r, i }) => (
                      <div
                        key={r.key}
                        className={`pd__row rise-in ${step.at === i ? "is-on" : ""} ${step.phase === "press" && step.at === i ? "is-press" : ""}`}
                        style={{ ["--i" as string]: i }}
                      >
                        {r.kind === "question" ? (
                          <span className="pd__dot" style={{ ["--diff-c" as string]: DIFF[r.difficulty ?? "Medium"] }} />
                        ) : (
                          <svg className="ui-icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                            <path d="M10 6h4M10 10h4M10 14h4" />
                          </svg>
                        )}
                        <span className="pd__t">{r.label}</span>
                        <span className="pd__meta">{r.meta}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
          <div className="pd__foot">
            <span>↑ ↓ to move</span>
            <span>↵ to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
