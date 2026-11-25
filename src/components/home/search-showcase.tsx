"use client";

import { useRef } from "react";
import { PauseButton } from "@/components/fx/pause-button";
import { useTicker } from "@/components/fx/use-ticker";
import { DifficultyAvatar } from "@/components/home/difficulty-avatar";
import type { HomeShowcase } from "@/lib/data";
import { initials, monogramHue } from "@/lib/utils";

const TONES = ["1", "2", "3", "4", "5"];

/** Search results beside the open question: who asks it, how often, and "save for revision". */
export function SearchShowcase({ data }: { data: HomeShowcase }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tick, paused, setPaused } = useTicker(ref, (t) => (t % 2 === 0 ? 2400 : 900));
  const saved = tick % 2 === 1;
  const open = data.open;
  const max = Math.max(...(open?.companies.map((c) => c.frequency) ?? [1]), 0.0001);
  const statuses = ["To do", "Solved", "To do", "Solved", "To do", "To do", "To do", "To do", "To do"];

  return (
    <div
      ref={ref}
      className="relative mt-12"
    >
      <div
        className="ui app-frame"
        role="img"
        aria-label={`The Dreamers listing the questions asked by the most companies, beside the open question, ${open?.title ?? ""}, with the companies that ask it most often`}
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
                Questions <i>/</i> <b>asked by most companies</b>
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
                <span className="ui-win__nav">Most asked</span>
                <span className="ui-win__nav">Frequency</span>
              </nav>
              <div className="ui-win__main">
                <ul className="ui-win__rows">
                  {data.mostAsked.map((q, i) => (
                    <li key={q.leetcodeId} className={`ui-win__row ${i === 0 ? "is-sel" : ""}`}>
                      <DifficultyAvatar d={q.difficulty} />
                      <span className="ui-win__who">{q.title}</span>
                      <span className="ui-win__sub">
                        {q.difficulty} · {q.companyCount} companies
                      </span>
                      <span className={`ui-win__st ${statuses[i] === "Solved" ? "is-done" : ""}`}>{statuses[i]}</span>
                      <span className="ui-win__age">{q.companyCount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="app-frame__pane">
          <div className={`ui ui-panel qd ${saved ? "is-saved" : ""}`}>
            <div className="qd__head">
              <DifficultyAvatar d={open?.difficulty ?? "Easy"} />
              <div className="ui-title">{open?.title}</div>
              <span className="ui-spacer" />
              <span className="ui-chip ui-chip--plain">Demo</span>
            </div>
            <div className="qd__tags">
              <span className="ui-chip">{open?.difficulty}</span>
              {open?.acceptance ? <span className="ui-chip ui-chip--plain">{open.acceptance.toFixed(1)}% accepted</span> : null}
              <span className="ui-chip ui-chip--plain">{open?.total} companies</span>
            </div>
            <div className="qd__acts">
              <span className="ui-btn">Mark solved</span>
              <span className={`ui-btn ui-btn--ghost ${saved ? "is-pressed" : ""}`}>Save for revision</span>
              <span className="ui-chip ui-chip--accent qd__saved">Saved to your revision list</span>
            </div>
            <div className="qd__label">Asked by {open?.total} companies, most often first</div>
            <ul className="qd__rows">
              {open?.companies.map((c, i) => (
                <li key={c.slug}>
                  <span className="ui-avatar" data-tone={TONES[monogramHue(c.slug) % 5]}>
                    {initials(c.name).slice(0, 1)}
                  </span>
                  <span className="truncate">{c.name}</span>
                  <span className="qd__bar">
                    <i style={{ ["--v" as string]: Math.max(0.04, c.frequency / max) }} />
                  </span>
                  <span className="qd__v">{i === 0 ? "#1" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} className="absolute right-3 bottom-3" />
    </div>
  );
}
