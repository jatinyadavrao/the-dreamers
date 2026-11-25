"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTicker } from "@/components/fx/use-ticker";

type Note = { id: string; title: string; time: string; body: string; kind: "today" | "kept" };

function Clock() {
  return (
    <svg className="ui-icon" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}
function Tick() {
  return (
    <svg className="ui-icon" viewBox="0 0 16 16">
      <path d="m3.5 8.4 2.8 2.8 6.2-6.4" />
    </svg>
  );
}

/**
 * The daily question as notifications on the lit ground: today's question on top, the days before it
 * kept below. Every few seconds the stack rolls: a day slides in on top and the oldest one leaves.
 */
export function DailyNotes({ today, past }: { today: { title: string; difficulty: string }; past: string[] }) {
  const label = `The Dreamers daily question: today's is ${today.title}, and the streak from the days before is kept`;
  const ref = useRef<HTMLDivElement>(null);
  const { tick } = useTicker(ref, () => 2800);
  // a day per note: day = tick - place. A note keeps its key as it moves down, its words follow its place.
  const titles = [today.title, ...(past.length ? past : ["Valid Parentheses", "Daily Temperatures"])];
  const at = (d: number) => titles[((d % titles.length) + titles.length) % titles.length];
  const notes: Note[] = [0, 1, 2].map((place) => {
    const day = tick - place;
    return place === 0
      ? { id: `d-${day}`, title: "Today's question", time: "now", body: day === 0 ? `${today.title}, ${today.difficulty.toLowerCase()}` : at(day), kind: "today" }
      : { id: `d-${day}`, title: "Streak kept", time: `${place}d`, body: `${at(day)}, solved`, kind: "kept" };
  });

  return (
    <div ref={ref} className="panel frame-lit" style={{ ["--p-h" as string]: "336px" }}>
      <div className="stage grid place-items-center px-6 py-8">
      <div className="ui ui-notify on-ground w-full max-w-[380px]" role="img" aria-label={label}>
        <ul className="ui-notify__list">
          <AnimatePresence initial={false} mode="popLayout">
            {notes.map((n, i) => (
              <motion.li
                key={n.id}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className="ui-note"
              >
                <span className="ui-note__ico">{n.kind === "today" ? <Clock /> : <Tick />}</span>
                <span className="ui-note__text">
                  <span className="ui-note__title">
                    {n.title}
                    <time>{n.time}</time>
                  </span>
                  <span className="ui-note__body">{n.body}</span>
                </span>
                {i === 0 && <span className="ui-btn ui-btn--sm ui-note__btn">Solve</span>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      </div>
    </div>
  );
}
