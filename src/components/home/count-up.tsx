"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

/**
 * A real number that counts up the first time it comes into view. The page is served with the number
 * itself (no script, search engines and reduced motion keep it); only a number still below the fold
 * when the page loads is reset to zero, unseen, and counts up when reached.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(value);
  const text = useTransform(mv, fmt);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();
  const armed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      armed.current = true;
      mv.set(0);
    }
  }, [mv, reduced]);

  useEffect(() => {
    if (!inView || !armed.current) return;
    armed.current = false;
    const c = animate(mv, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [inView, mv, value]);

  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      {/* the final number holds the width, so nothing shifts while it counts */}
      <span className="invisible">{fmt(value)}</span>
      <motion.span className="absolute inset-0 text-left" aria-hidden="true">
        {text}
      </motion.span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  );
}
