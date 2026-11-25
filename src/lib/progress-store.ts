"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

/**
 * The signed-in user's ticks, shared by every list on the page (a table and the question drawer
 * see the same state). Loaded from /api/progress; changes are optimistic.
 *
 * - The state belongs to one account (owner): another account in the same tab never sees it.
 * - Saves for one question go out one after another, so a quick double click lands in order.
 * - A failed save puts back only the field it changed, and only if nothing changed it since.
 * - A load that answers while a question has newer local changes keeps the local entry.
 */
export type ProgressEntry = { solved: boolean; bookmarked: boolean; solvedAt: string | null };
type Row = { leetcodeId: number };
type Field = "solved" | "bookmarked";

const EMPTY: Record<number, ProgressEntry> = {};
let owner: string | null = null;
let state: Record<number, ProgressEntry> = EMPTY;
let inflight: Promise<void> | null = null;
let version = 0; // bumps on every local change
const touched = new Map<number, number>(); // question -> version of its last local change
const queues = new Map<number, Promise<unknown>>(); // question -> its pending saves
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function reset(next: string | null) {
  owner = next;
  state = EMPTY;
  touched.clear();
  inflight = null;
}

export function loadProgress(): Promise<void> {
  if (inflight) return inflight;
  const startedAt = version;
  const forOwner = owner;
  const p = fetch("/api/progress", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((rows: { leetcodeId: number; solved: boolean; bookmarked: boolean; solvedAt?: string | null }[] | null) => {
      if (!rows || owner !== forOwner) return;
      const next: Record<number, ProgressEntry> = {};
      for (const r of rows) next[r.leetcodeId] = { solved: r.solved, bookmarked: r.bookmarked, solvedAt: r.solvedAt ?? null };
      // a question changed here after this load started keeps what the visitor did
      for (const [id, v] of touched) {
        if (v > startedAt) {
          if (state[id]) next[id] = state[id];
          else delete next[id];
        }
      }
      state = next;
      emit();
    })
    .catch(() => {})
    .finally(() => {
      if (inflight === p) inflight = null;
    });
  inflight = p;
  return p;
}

/** Subscribe to the ticks of the signed-in account; loads them once per mount. */
export function useProgress(enabled: boolean) {
  const { user } = useAuth();
  const me = enabled ? (user?.email ?? null) : null;
  const snap = useSyncExternalStore(subscribe, () => (me && owner === me ? state : EMPTY), () => EMPTY);
  useEffect(() => {
    if (!me) return;
    if (owner !== me) reset(me);
    loadProgress();
  }, [me]);
  return me ? snap : EMPTY;
}

function post(leetcodeId: number, action: string) {
  return fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leetcodeId, action }),
  })
    .then((r) => r.ok)
    .catch(() => false);
}

/** Flip solved or bookmarked for one question (signed in). */
export function toggleProgress(row: Row, field: Field) {
  const id = row.leetcodeId;
  const cur = state[id] ?? { solved: false, bookmarked: false, solvedAt: null };
  const value = !cur[field];
  const next: ProgressEntry = {
    ...cur,
    [field]: value,
    solvedAt: field === "solved" ? (value ? new Date().toISOString() : null) : cur.solvedAt,
  };
  state = { ...state, [id]: next };
  version += 1;
  touched.set(id, version);
  const mine = version;
  emit();

  const action = field === "solved" ? (value ? "solve" : "unsolve") : value ? "bookmark" : "unbookmark";
  const forOwner = owner;
  const run = (queues.get(id) ?? Promise.resolve()).then(async () => {
    const ok = await post(id, action);
    if (ok || owner !== forOwner) return;
    // put back only this field, and only if nothing has changed it since
    const now = state[id];
    if (now && now[field] === value && touched.get(id) === mine) {
      state = {
        ...state,
        [id]: { ...now, [field]: !value, solvedAt: field === "solved" ? cur.solvedAt : now.solvedAt },
      };
      emit();
    }
  });
  queues.set(id, run);
  run.finally(() => {
    if (queues.get(id) === run) queues.delete(id);
  });
  return run;
}

/** toggle(row, field): flips a tick, or takes a signed-out visitor to sign in and back. */
export function useToggleProgress() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  return useCallback(
    (row: Row, field: Field) => {
      if (!isSignedIn) {
        router.push(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      return toggleProgress(row, field);
    },
    [router, isSignedIn]
  );
}
