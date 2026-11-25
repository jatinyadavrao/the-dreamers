"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/** Words that light up one after another as the line scrolls up through the screen. */
export function ScrollWords({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "end 0.5"] });
  const words = text.split(" ");
  if (reduced) return <>{text}</>;
  return (
    <span ref={ref}>
      {words.map((w, i) => (
        <Word key={`${w}-${i}`} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </Word>
      ))}
    </span>
  );
}

function Word({
  progress,
  from,
  to,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, [from, to], [0.16, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
