"use client";

import { useEffect, useRef } from "react";

/**
 * Liquid type (ported from taste-skill's moment, MIT): the headline ripples like type seen through
 * water where the pointer crosses it and settles back to crisp type within about a second. One SVG
 * displacement filter, applied only while the ripple is alive. Touch, reduced motion: plain type.
 */
export function LiquidType({
  children,
  className,
  id,
  strength = 1,
  reach = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  strength?: number;
  reach?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const type = ref.current;
    if (!type) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse || typeof SVGFEDisplacementMapElement === "undefined") return;

    const ns = "http://www.w3.org/2000/svg";
    const fid = `lt-${Math.random().toString(36).slice(2, 8)}`;
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;pointer-events:none";
    const filter = document.createElementNS(ns, "filter");
    filter.setAttribute("id", fid);
    filter.setAttribute("x", "-5%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "110%");
    filter.setAttribute("height", "140%");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    const turb = document.createElementNS(ns, "feTurbulence");
    turb.setAttribute("type", "fractalNoise");
    turb.setAttribute("baseFrequency", "0.006 0.013");
    turb.setAttribute("numOctaves", "1");
    turb.setAttribute("seed", "7");
    turb.setAttribute("result", "n");
    const disp = document.createElementNS(ns, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "n");
    disp.setAttribute("scale", "0");
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    filter.append(turb, disp);
    svg.append(filter);
    document.body.append(svg);

    const k = Math.min(1.6, Math.max(0.3, strength));
    const r = Math.min(0.6, Math.max(0.1, reach));
    let energy = 0;
    let raf = 0;
    let on = false;
    let lastX = 0;
    let lastY = 0;
    let hasLast = false;
    let t0 = 0;
    let px = 0.5;

    const apply = () => {
      const sc = Math.min(44, energy) * k;
      if (sc < 0.6) {
        if (on) {
          type.style.filter = "";
          on = false;
        }
        return false;
      }
      disp.setAttribute("scale", sc.toFixed(1));
      const dx = 0.006 + (px - 0.5) * 0.002;
      const dy = 0.013 + Math.sin(t0 / 700) * 0.003;
      turb.setAttribute("baseFrequency", `${dx.toFixed(4)} ${dy.toFixed(4)}`);
      if (!on) {
        type.style.filter = `url(#${fid})`;
        on = true;
      }
      return true;
    };
    const tick = (now: number) => {
      raf = 0;
      t0 = now;
      energy *= 0.93;
      if (apply()) raf = requestAnimationFrame(tick);
      else energy = 0;
    };
    const move = (e: PointerEvent) => {
      const b = type.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const inside = x > -b.width * 0.04 && x < b.width * 1.04 && y > -b.height * 0.2 && y < b.height * 1.2;
      if (!inside) {
        hasLast = false;
        return;
      }
      px = Math.min(1, Math.max(0, x / b.width));
      if (hasLast) {
        const v = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        energy = Math.min(44, energy + Math.min(9, v * 0.3) * (0.5 + r));
      }
      lastX = e.clientX;
      lastY = e.clientY;
      hasLast = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      hasLast = false;
    };
    type.addEventListener("pointermove", move, { passive: true });
    type.addEventListener("pointerleave", leave);
    return () => {
      type.removeEventListener("pointermove", move);
      type.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
      type.style.filter = "";
      svg.remove();
    };
  }, [strength, reach]);

  return (
    <h2 ref={ref} id={id} className={className}>
      {children}
    </h2>
  );
}
