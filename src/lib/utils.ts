import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a company file slug like "american-express" -> "American Express". */
export function prettifyCompany(slug: string): string {
  const overrides: Record<string, string> = {
    "c3-iot": "C3 IoT",
    c3ai: "C3.ai",
    "arista-networks": "Arista Networks",
    bytedance: "ByteDance",
    "akuna-capital": "Akuna Capital",
  };
  if (overrides[slug]) return overrides[slug];
  return slug
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const TIMEFRAMES = ["alltime", "2year", "1year", "6months"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  alltime: "All Time",
  "2year": "2 Years",
  "1year": "1 Year",
  "6months": "6 Months",
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

/**
 * Turn a shared Google Drive link into a directly-embeddable image URL.
 * Handles /file/d/<id>/view, ?id=<id>, and uc?id=<id> forms. Other URLs pass through.
 * (The Drive file must be shared as "Anyone with the link".)
 */
export function toDirectImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes("drive.google.com")) {
    const m = url.match(/\/d\/([\w-]+)/) ?? url.match(/[?&]id=([\w-]+)/);
    if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  }
  return url;
}

/** Deterministic pseudo-random index for "daily challenge" based on the date. */
export function dailyIndex(length: number, date = new Date()): number {
  if (length <= 0) return 0;
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}
