"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setHovering(!!el.closest("a, button, [role='button'], input, textarea, select, .cursor-hover"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  // Decorative ring that trails the real (still-visible) pointer.
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100001] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dream-400/70 mix-blend-difference"
      style={{ x: ringX, y: ringY }}
      animate={{
        width: hovering ? 46 : 26,
        height: hovering ? 46 : 26,
        opacity: hovering ? 1 : 0.55,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    />
  );
}
