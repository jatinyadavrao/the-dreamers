import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Names the dataset's slugs cannot spell on their own. */
const COMPANY_NAMES: Record<string, string> = {
  "c3-iot": "C3 IoT",
  c3ai: "C3.ai",
  "arista-networks": "Arista Networks",
  bytedance: "ByteDance",
  bytedancetoutiao: "ByteDance Toutiao",
  "akuna-capital": "Akuna Capital",
  appdynamics: "AppDynamics",
  blackrock: "BlackRock",
  bookingcom: "Booking.com",
  box: "Box",
  "capital-one": "Capital One",
  "de-shaw": "D. E. Shaw",
  deliveryhero: "Delivery Hero",
  docusign: "DocuSign",
  doordash: "DoorDash",
  ebay: "eBay",
  factset: "FactSet",
  forusall: "ForUsAll",
  godaddy: "GoDaddy",
  inmobi: "InMobi",
  jpmorgan: "JPMorgan",
  "jp-morgan-chase": "JPMorgan Chase",
  limebike: "LimeBike",
  linkedin: "LinkedIn",
  liveramp: "LiveRamp",
  machinezone: "Machine Zone",
  mathworks: "MathWorks",
  mckinsey: "McKinsey",
  medianet: "Media.net",
  microstrategy: "MicroStrategy",
  netease: "NetEase",
  netsuite: "NetSuite",
  paypal: "PayPal",
  phonepe: "PhonePe",
  ponyai: "Pony.ai",
  servicenow: "ServiceNow",
  sumologic: "Sumo Logic",
  tandemg: "TandemG",
  "two-sigma": "Two Sigma",
  uipath: "UiPath",
  vmware: "VMware",
  youtube: "YouTube",
};

/** Words in slugs that are acronyms (everything else is title-cased). */
const ACRONYMS = new Set(["emc", "ge", "gsn", "hbo", "hrt", "ibm", "iit", "ixl", "maq", "sap", "ea", "jp", "f5"]);

function titleCase(slug: string, upper: (w: string) => boolean): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => (upper(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Convert a company file slug like "american-express" -> "American Express". */
export function prettifyCompany(slug: string): string {
  if (COMPANY_NAMES[slug]) return COMPANY_NAMES[slug];
  return titleCase(slug, (w) => ACRONYMS.has(w));
}

/** The name the old seed wrote (every word of 3 letters or fewer in capitals). */
function legacyCompanyName(slug: string): string {
  const legacy: Record<string, string> = {
    "c3-iot": "C3 IoT",
    c3ai: "C3.ai",
    "arista-networks": "Arista Networks",
    bytedance: "ByteDance",
    "akuna-capital": "Akuna Capital",
  };
  return legacy[slug] ?? titleCase(slug, (w) => w.length <= 3);
}

/**
 * The name to show for a company. A name still exactly as the old seed generated it gets the
 * corrected spelling ("Capital ONE" -> "Capital One"); a name an admin typed is shown as typed.
 */
export function companyLabel(name: string | undefined, slug: string): string {
  if (!name || name === legacyCompanyName(slug)) return prettifyCompany(slug);
  return name;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Escape user text for use inside a RegExp / MongoDB $regex. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A stable tone (hue) for a company monogram, never violet. */
export function monogramHue(slug: string): number {
  const hues = [40, 85, 150, 200, 20, 120, 60, 175];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return hues[Math.abs(h) % hues.length];
}

export function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const TIMEFRAMES = ["alltime", "2year", "1year", "6months"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  alltime: "All time",
  "2year": "2 years",
  "1year": "1 year",
  "6months": "6 months",
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Chart colours come from CSS (--easy / --medium / --hard), validated for both themes. */
export const DIFFICULTY_VARS: Record<Difficulty, string> = {
  Easy: "var(--easy)",
  Medium: "var(--medium)",
  Hard: "var(--hard)",
};

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

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

/**
 * Where to send someone after signing in: a path on this site only. URL parsers drop tabs and
 * newlines and read "\\" as "/", so "/%09/evil.example" or "/\\evil.example" would leave the site:
 * any control character, whitespace or backslash is refused, and the result must resolve here.
 */
export function safeNext(raw: string | null | undefined, fallback = "/companies"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (/[\u0000-\u0020\u007f\\]/.test(raw)) return fallback;
  try {
    const base = "http://same-site.invalid";
    const u = new URL(raw, base);
    if (u.origin !== base) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
