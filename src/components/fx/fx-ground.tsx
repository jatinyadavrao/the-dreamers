"use client";

import { useEffect, useRef } from "react";
import type { FxPalette } from "@/lib/fx/fx.js";
import { cn } from "@/lib/utils";

type EffectId = "painterly-landscape" | "gradient-mesh";

/**
 * A WebGL ground (the vendored taste-skill effects) laid behind a frame's content. It renders only
 * while on screen, holds a still frame under reduced motion, and falls back to CSS without WebGL.
 */
export function FxGround({
  effect,
  palette,
  params,
  seed,
  className,
}: {
  effect: EffectId;
  palette: FxPalette;
  params?: Record<string, number>;
  seed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify({ effect, palette, params, seed });

  useEffect(() => {
    let dead = false;
    let ctl: { destroy(): void } | null = null;
    (async () => {
      const fx = await import("@/lib/fx/fx.js");
      const mod =
        effect === "painterly-landscape"
          ? await import("@/lib/fx/painterly-landscape/effect.js")
          : await import("@/lib/fx/gradient-mesh/effect.js");
      if (dead || !ref.current) return;
      const c = await fx.mount(ref.current, mod.default, { palette, params, seed });
      if (dead) c.destroy();
      else ctl = c;
    })().catch(() => {
      /* the frame keeps its CSS ground */
    });
    return () => {
      dead = true;
      ctl?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <div ref={ref} aria-hidden="true" className={cn("absolute inset-0 z-0", className)} />;
}

export const SAGE: FxPalette = {
  bg: "#cdd6c6",
  surface: "#dce3d6",
  ink: "#262d24",
  muted: "#535b51",
  accent: "#6c8e63",
  accentInk: "#dce3d6",
};
