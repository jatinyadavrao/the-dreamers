"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useTicker } from "@/components/fx/use-ticker";
import { DifficultyAvatar } from "@/components/home/difficulty-avatar";
import type { HomeShowcase } from "@/lib/data";

type Status = "To do" | "Solved" | "Revise";
const START: Status[] = ["Solved", "Solved", "To do", "To do", "Revise", "To do", "To do"];

/**
 * The hero's product window on the dot-terrain stage: a company's most-asked questions, worked
 * down one row at a time (To do -> Solving -> Solved), then the list starts over.
 */
export function HeroWindow({ data }: { data: HomeShowcase }) {
  const frame = useRef<HTMLDivElement>(null);
  const rows = data.hero?.rows ?? [];
  const open = START.slice(0, rows.length)
    .map((s, i) => (s === "To do" ? i : -1))
    .filter((i) => i >= 0);
  const { tick } = useTicker(frame, (t) => (t % 2 === 0 ? 1500 : 900));
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 110, damping: 18, mass: 0.6 });
  const ry = useSpring(0, { stiffness: 110, damping: 18, mass: 0.6 });
  const lean = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - b.left) / b.width - 0.5) * 7);
    rx.set(-((e.clientY - b.top) / b.height - 0.5) * 5);
  };
  const settle = () => {
    rx.set(0);
    ry.set(0);
  };
  // step j: the first j open rows are solved, open row j is being solved; j = 0 is the list as written
  const j = tick % (open.length + 1);

  const statusOf = (i: number): { word: string; cls: string } => {
    const n = open.indexOf(i);
    if (n >= 0 && n < j - 1) return { word: "Solved", cls: "is-done" };
    if (n >= 0 && n === j - 1) return { word: "Solving", cls: "is-work" };
    const s = START[i];
    if (s === "Solved") return { word: "Solved", cls: "is-done" };
    if (s === "Revise") return { word: "Revise", cls: "is-you" };
    return { word: "To do", cls: "" };
  };

  const company = data.hero?.company ?? "Amazon";

  return (
    <div
      ref={frame}
      className="hero-window enter-settle"
      onPointerMove={lean}
      onPointerLeave={settle}
    >
      <div
        className="hero-window__piece"
        role="img"
        aria-label={`The Dreamers showing ${company}'s questions sorted by how often each is asked, with the solved ones ticked off`}
      >
        <motion.div className="ui ui-panel ui-win" style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}>
          <div className="ui-win__bar">
            <span className="ui-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="ui-win__crumb">
              <span className="crumb-up">Companies</span> <i className="crumb-up">/</i> <b>{company}</b>
            </span>
            <span className="ui-spacer" />
            <span className="ui-chip ui-chip--plain">Demo</span>
            <span className="ui-win__search">
              <svg className="ui-icon" viewBox="0 0 16 16">
                <circle cx="7" cy="7" r="4.5" />
                <path d="m10.5 10.5 3 3" />
              </svg>
              <span className="ui-win__ph">Search questions</span>
              <span className="ui-kbd">/</span>
            </span>
          </div>
          <div className="ui-win__body">
            <nav className="ui-win__side">
              <span className="ui-win__label">Companies</span>
              {data.companies.slice(0, 5).map((c, i) => (
                <span key={c.slug} className={`ui-win__nav ${i === 0 ? "is-on" : ""}`}>
                  {c.name}
                </span>
              ))}
              <span className="ui-win__label">Your lists</span>
              <span className="ui-win__nav">
                <svg className="ui-icon" viewBox="0 0 16 16">
                  <path d="M4.5 2.5h7v11L8 11l-3.5 2.5z" />
                </svg>
                Revision
              </span>
              <span className="ui-win__nav">
                <svg className="ui-icon" viewBox="0 0 16 16">
                  <path d="m3.5 8.4 2.8 2.8 6.2-6.4" />
                </svg>
                Solved
              </span>
            </nav>
            <div className="ui-win__main">
              <div className="ui-win__cols">
                <span>Question</span>
                <span>Level and acceptance</span>
                <span>Status</span>
                <span>Rank</span>
              </div>
              <ul className="ui-win__rows">
                {rows.map((r, i) => {
                  const st = statusOf(i);
                  return (
                    <li key={r.leetcodeId} className={`ui-win__row ${st.cls === "is-work" ? "is-sel" : ""}`}>
                      <DifficultyAvatar d={r.difficulty} />
                      <span className="ui-win__who">{r.title}</span>
                      <span className="ui-win__sub">
                        {r.difficulty} · {r.acceptance ? `${r.acceptance.toFixed(1)}% accepted` : "LeetCode"}
                      </span>
                      <span className={`ui-win__st ${st.cls}`}>{st.word}</span>
                      <span className="ui-win__age">#{i + 1}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
