/** Day-level activity in the visitor's own time zone: streaks and the activity grid. */

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Solves per local day, from ISO timestamps. */
export function countByDay(isoDates: (string | null | undefined)[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const iso of isoDates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const k = dayKey(d);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/**
 * current: consecutive days with a solve, ending today (or yesterday, so a streak is not lost before
 * today's question is done); longest: the best run ever; today: whether today already counts.
 */
export function streaks(byDay: Map<string, number>, now = new Date()) {
  const has = (d: Date) => (byDay.get(dayKey(d)) ?? 0) > 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = has(cursor);
  if (!today) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (has(cursor)) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const keys = [...byDay.keys()].filter((k) => (byDay.get(k) ?? 0) > 0).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    if (prev && Math.round((day.getTime() - prev.getTime()) / 86400000) === 1) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = day;
  }
  return { current, longest: Math.max(longest, current), today };
}
