"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Steps a looping picture forward while it is on screen and the tab is visible. delayFor(tick) is
 * how long the current step holds. Reduced motion: the picture rests on its first step.
 */
export function useTicker(ref: RefObject<HTMLElement | null>, delayFor: (tick: number) => number) {
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [tick, setTick] = useState(0);
  const delay = useRef(delayFor);
  useEffect(() => {
    delay.current = delayFor;
  });

  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  const active = inView && !reduced && visible;
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setTick((x) => x + 1), delay.current(tick));
    return () => window.clearTimeout(t);
  }, [active, tick]);

  return { tick, active, inView, reduced: !!reduced };
}

/** True while the element is on screen, the tab is visible and motion is allowed. */
export function useActive(ref: RefObject<HTMLElement | null>) {
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return inView && !reduced && visible;
}
