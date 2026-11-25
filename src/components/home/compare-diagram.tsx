"use client";

import { useRef } from "react";
import { useTicker } from "@/components/fx/use-ticker";

function Building() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </svg>
  );
}

/**
 * Two companies' lists joined by the questions both ask: the link draws itself in and the shared
 * rows light up together on both sides, one after another.
 */
export function CompareDiagram({
  a,
  b,
  shared,
  sharedCount,
}: {
  a: string;
  b: string;
  shared: { title: string; difficulty: string }[];
  sharedCount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { tick, inView } = useTicker(ref, () => 1500);
  const on = shared.length ? tick % shared.length : 0;
  return (
    <div
      ref={ref}
      className={`panel ${inView ? "dg-live" : ""}`}
      style={{ ["--p-h" as string]: "336px" }}
      role="img"
      aria-label={`${a}'s list and ${b}'s list, with the ${sharedCount ?? shared.length} questions both companies ask linked between them`}
    >
      <div className="ui dg" aria-hidden="true">
        <DiagramList name={a} shared={shared} on={on} />
        <div className="dg__link">
          <span className="dg__pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" />
              <path d="M11 18H8a2 2 0 0 1-2-2V9" />
            </svg>
            Both ask{sharedCount ? ` · ${sharedCount}` : ""}
          </span>
        </div>
        <DiagramList name={b} shared={shared} on={on} />
      </div>
    </div>
  );
}

function DiagramList({ name, shared, on }: { name: string; shared: { title: string; difficulty: string }[]; on: number }) {
  return (
    <div className="ui ui-panel dg__list">
      <div className="ui-head">
        <Building />
        <span className="ui-title">{name}</span>
        <span className="ui-spacer" />
        <span className="ui-meta">List</span>
      </div>
      {shared.map((q, i) => (
        <div key={q.title} className={`dg__row ${i === on ? "is-on" : ""}`}>
          <span>{q.title}</span>
          <span>{q.difficulty}</span>
        </div>
      ))}
    </div>
  );
}
