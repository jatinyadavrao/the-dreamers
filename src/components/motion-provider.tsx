"use client";

import { MotionConfig } from "framer-motion";

/** Every framer animation follows the visitor's reduced-motion setting: no movement, fades only. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
