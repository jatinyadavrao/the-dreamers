"use client";

import { useRef } from "react";
import { useTicker } from "@/components/fx/use-ticker";

/** A company list whose open items tick one after another while the bar fills, then starts over. */
export function ChecklistCard({ company, items }: { company: string; items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = Math.min(2, items.length);
  const left = Math.max(1, items.length - start);
  // one step per item, a hold on all done, then a quick reset
  const { tick } = useTicker(ref, (t) => {
    const s = t % (left + 2);
    if (s === left) return 1400;
    if (s === left + 1) return 500;
    return 620;
  });
  const s = tick % (left + 2);
  const done = s === left + 1 ? start : Math.min(items.length, start + s);
  const now = s > 0 && s <= left ? start + s - 1 : -1;

  return (
    <div ref={ref} className="panel" style={{ ["--p-h" as string]: "336px" }}>
      <div
        className="stage stage-fade-b"
        role="img"
        aria-label={`${company}'s list with ${start} of ${items.length} questions solved, the next ones ticking off in turn`}
      >
        <div className="absolute top-10 right-6 left-6 mx-auto max-w-[340px] max-sm:top-6">
          <div className="ui ui-panel ui-checks w-full">
            <div className="ui-checks__head">
              <div className="ui-title">{company}</div>
              <span className="ui-spacer" />
              <div className="ui-meta">
                {done} of {items.length} solved
              </div>
            </div>
            <div className="ui-checks__bar">
              <i style={{ ["--k" as string]: items.length ? done / items.length : 0 }} />
            </div>
            <ul className="ui-checks__list">
              {items.map((label, i) => (
                <li key={label} className={`ui-check ${i < done ? "is-done" : ""} ${i === now ? "is-now" : ""}`}>
                  <span className="ui-check__box">
                    <svg viewBox="0 0 16 16">
                      <path d="m4.5 8.2 2.3 2.3 4.7-5" />
                    </svg>
                  </span>
                  <span className="ui-check__label">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
