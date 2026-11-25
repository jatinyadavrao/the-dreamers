"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/** A text button in the link look: the sun on the dark theme, the moon on the light one (what a press does). */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("inline-flex min-h-11 items-center gap-2 transition-colors", className)}
    >
      {dark ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
          <path
            d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{dark ? "Switch to light" : "Switch to dark"}</span>
    </button>
  );
}
