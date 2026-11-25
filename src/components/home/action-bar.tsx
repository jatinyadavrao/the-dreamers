"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** The phone's quick action: once the hero's button scrolls away, it waits at the foot of the screen. */
export function ActionBar({ watch = "hero-cta", href = "/companies", label = "Find your company" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById(watch);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);
  return (
    <nav
      aria-label="Quick actions"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] sm:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <Link href={href} className="btn btn-primary h-12 w-full" tabIndex={show ? 0 : -1}>
        {label}
      </Link>
    </nav>
  );
}
