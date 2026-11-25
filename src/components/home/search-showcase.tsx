"use client";

import { useMemo, useRef } from "react";
import { useTicker } from "@/components/fx/use-ticker";
import { DifficultyAvatar } from "@/components/home/difficulty-avatar";
import type { HomeShowcase } from "@/lib/data";
import { initials, monogramHue } from "@/lib/utils";

const TONES = ["1", "2", "3", "4", "5"];
type Phase = "type" | "results" | "open" | "save" | "clear";
type Step = { s: number; phase: Phase; k: number; ms: number };

/**
 * The app searching for real: a keyword is typed, the questions it finds come in (most widely asked
 * first), the top one opens with the companies that ask it, and it is saved for revision. Then the
 * next keyword. The first frame (and the still picture under reduced motion) is the finished search.
 */
export function SearchShowcase({ data }: { data: HomeShowcase }) {
  const ref = useRef<HTMLDivElement>(null);
  const scenes = data.searches.length
    ? data.searches
    : [{ query: "", results: data.mostAsked, open: data.open ?? data.searches[0]?.open }].filter((x) => x.open);

  const timeline = useMemo(() => {
    const t: Step[] = [];
    scenes.forEach((sc, s) => {
      for (let k = 1; k <= sc.query.length; k++) t.push({ s, phase: "type", k, ms: 110 });
      t.push({ s, phase: "results", k: sc.query.length, ms: 650 });
      t.push({ s, phase: "open", k: sc.query.length, ms: 1500 });
      t.push({ s, phase: "save", k: sc.query.length, ms: 2300 });
      t.push({ s, phase: "clear", k: 0, ms: 420 });
    });
    // start on the first finished search, so the first paint is a whole picture
    const at = Math.max(0, t.findIndex((x) => x.s === 0 && x.phase === "open"));
    return [...t.slice(at), ...t.slice(0, at)];
  }, [scenes]);

  const { tick } = useTicker(ref, (n) => timeline[n % timeline.length]?.ms ?? 1000);
  if (!scenes.length) return null;
  const step = timeline[tick % timeline.length];
  const sc = scenes[step.s];
  const typed = step.phase === "clear" ? "" : sc.query.slice(0, step.k);
  const typing = step.phase === "type" || step.phase === "clear";
  const showRows = step.phase === "results" || step.phase === "open" || step.phase === "save";
  const showOpen = step.phase === "open" || step.phase === "save";
  const saved = step.phase === "save";
  const open = sc.open;
  const max = Math.max(0.0001, ...open.companies.map((c) => c.frequency));

  return (
    <div ref={ref} className="relative mt-12">
      <div
        className="ui app-frame"
        role="img"
        aria-label={`The Dreamers searching every company's questions for "${sc.query}", opening ${open.title} with the companies that ask it most often`}
      >
        <div className="app-frame__pane app-frame__pane--list">
          <div className="ui ui-panel ui-win ui-win--fill">
            <div className="ui-win__bar">
              <span className="ui-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="ui-win__crumb">
                Questions <i>/</i> <b>{typed || "all companies"}</b>
              </span>
              <span className="ui-spacer" />
              <span className="ui-win__search !w-[150px]">
                <svg className="ui-icon" viewBox="0 0 16 16">
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="m10.5 10.5 3 3" />
                </svg>
                <span className="ui-win__ph !text-[var(--u-ink)]">
                  {typed}
                  {typing && <span className="caret" />}
                </span>
              </span>
            </div>
            <div className="ui-win__body">
              <nav className="ui-win__side">
                <span className="ui-win__label">Difficulty</span>
                <span className="ui-win__nav is-on">All</span>
                <span className="ui-win__nav">Easy</span>
                <span className="ui-win__nav">Medium</span>
                <span className="ui-win__nav">Hard</span>
                <span className="ui-win__label">Sort</span>
                <span className="ui-win__nav is-on">Most companies</span>
                <span className="ui-win__nav">Frequency</span>
              </nav>
              <div className="ui-win__main">
                {showRows ? (
                  <ul className="ui-win__rows" key={`rows-${step.s}`}>
                    {sc.results.map((q, i) => (
                      <li
                        key={q.leetcodeId}
                        className={`ui-win__row rise-in ${showOpen && i === 0 ? "is-sel" : ""}`}
                        style={{ ["--i" as string]: i }}
                      >
                        <DifficultyAvatar d={q.difficulty} />
                        <span className="ui-win__who">{q.title}</span>
                        <span className="ui-win__sub">
                          {q.difficulty} · {q.companyCount} companies
                        </span>
                        <span className={`ui-win__st ${q.leetcodeId % 3 === 0 ? "is-done" : ""}`}>
                          {q.leetcodeId % 3 === 0 ? "Solved" : "To do"}
                        </span>
                        <span className="ui-win__age">{q.companyCount}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="ui-win__rows">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="ui-win__row">
                        <span className="ui-skel" style={{ width: 24, height: 24, borderRadius: 999 }} />
                        <span className="ui-skel" style={{ width: `${70 - i * 6}%` }} />
                        <span className="ui-skel" style={{ width: "50%" }} />
                        <span className="ui-skel" style={{ width: 48 }} />
                        <span />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="app-frame__pane">
          {showOpen ? (
            <div className={`ui ui-panel qd ${saved ? "is-saved" : ""}`} key={`open-${step.s}`}>
              <div className="qd__head">
                <DifficultyAvatar d={open.difficulty} />
                <div className="ui-title">{open.title}</div>
                <span className="ui-spacer" />
                <span className="ui-chip ui-chip--plain">Demo</span>
              </div>
              <div className="qd__tags">
                <span className="ui-chip">{open.difficulty}</span>
                {open.acceptance ? <span className="ui-chip ui-chip--plain">{open.acceptance.toFixed(1)}% accepted</span> : null}
                <span className="ui-chip ui-chip--plain">{open.total} companies</span>
              </div>
              <div className="qd__acts">
                <span className="ui-btn">Mark solved</span>
                <span className={`ui-btn ui-btn--ghost ${saved ? "is-pressed" : ""}`}>Save for revision</span>
                <span className="ui-chip ui-chip--accent qd__saved">Saved to your revision list</span>
              </div>
              <div className="qd__label">Asked by {open.total} companies, most often first</div>
              <ul className="qd__rows">
                {open.companies.map((c, i) => (
                  <li key={c.slug} className="rise-in" style={{ ["--i" as string]: i }}>
                    <span className="ui-avatar" data-tone={TONES[monogramHue(c.slug) % 5]}>
                      {initials(c.name).slice(0, 1)}
                    </span>
                    <span className="truncate">{c.name}</span>
                    <span className="qd__bar">
                      <i className="bar-grow" style={{ ["--v" as string]: Math.max(0.04, c.frequency / max), ["--i" as string]: i }} />
                    </span>
                    <span className="qd__v">{i === 0 ? "#1" : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="ui ui-panel qd">
              <div className="qd__head">
                <span className="ui-skel" style={{ width: 24, height: 24, borderRadius: 999 }} />
                <span className="ui-skel" style={{ width: 192, height: 10 }} />
              </div>
              <div className="qd__label">{typing ? "Searching every company…" : "Open a question to see who asks it"}</div>
              <ul className="qd__rows">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i}>
                    <span className="ui-skel" style={{ width: 24, height: 24, borderRadius: 999 }} />
                    <span className="ui-skel" style={{ width: 80 }} />
                    <span className="qd__bar" />
                    <span />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
