"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monogram } from "@/components/ui/kit";
import { useActive } from "@/components/fx/use-ticker";

type Co = { name: string; slug: string; questionCount: number };
const CELLS = 12;

/**
 * A wall of the companies with the most questions, inside the page's own width. The tiles stay put;
 * every couple of seconds one of them turns over to another company, so the wall shows them all
 * over time without anything sliding across the screen. Reduced motion: the first twelve, still.
 */
export function CompanyWall({ companies }: { companies: Co[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useActive(ref);
  const [wall, setWall] = useState(() => ({
    cells: companies.slice(0, CELLS),
    queue: companies.slice(CELLS),
    n: 0,
  }));

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setWall((w) => {
        if (!w.queue.length) return w;
        // a stride through the cells, so the turns look scattered rather than in order
        const at = (w.n * 7 + 3) % w.cells.length;
        const cells = [...w.cells];
        const out = cells[at];
        cells[at] = w.queue[0];
        return { cells, queue: [...w.queue.slice(1), out], n: w.n + 1 };
      });
    }, 1700);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
      {wall.cells.map((c, i) => (
        <div
          key={i}
          className={`relative h-[68px] overflow-hidden rounded-[6px] border border-line bg-surface ${i >= 6 ? "hidden lg:block" : ""}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center gap-3 px-3.5"
            >
              <Monogram name={c.name} slug={c.slug} size={32} />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium">{c.name}</span>
                <span className="block text-[12px] text-muted">{c.questionCount} questions</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
