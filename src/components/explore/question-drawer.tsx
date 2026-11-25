"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Monogram } from "@/components/ui/kit";
import { useProgress, useToggleProgress } from "@/lib/progress-store";
import type { QuestionDetail } from "@/lib/data";
import { cn } from "@/lib/utils";

const TF_SHORT: Record<string, string> = { "6months": "6 mo", "1year": "1 yr", "2year": "2 yr" };
const cache = new Map<number, QuestionDetail>();

/** The open question beside the list: who asks it, how often and how recently; tick or save it here. */
export function QuestionDrawer({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const { isSignedIn } = useAuth();
  const progress = useProgress(isSignedIn);
  const toggle = useToggleProgress();
  const [res, setRes] = useState<{ id: number; data: QuestionDetail | null; error: boolean } | null>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const cached = id != null ? (cache.get(id) ?? null) : null;
  const data = cached ?? (res && res.id === id ? res.data : null);
  const error = !cached && !!res && res.id === id && res.error;

  useEffect(() => {
    if (id == null || cache.has(id)) return;
    const ctl = new AbortController();
    fetch(`/api/questions/${id}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: QuestionDetail) => {
        cache.set(id, d);
        setRes({ id, data: d, error: false });
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setRes({ id, data: null, error: true });
      });
    return () => ctl.abort();
  }, [id]);

  useEffect(() => {
    if (id == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, onClose]);

  useEffect(() => {
    if (data && id === data.leetcodeId) head.current?.focus();
  }, [data, id]);

  const p = id != null ? progress[id] : undefined;
  const max = Math.max(0.0001, ...(data?.companies.map((c) => c.frequency) ?? [1]));

  return (
    <AnimatePresence>
      {id != null && (
        <motion.aside
          key="drawer"
          aria-label="Question details"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
          exit={{ x: 16, opacity: 0, transition: { duration: 0.14 } }}
          className="fixed top-[var(--nav)] right-0 bottom-0 z-40 flex w-full flex-col border-l border-line bg-bg shadow-[-24px_0_48px_-24px_rgb(0_0_0/0.5)] sm:w-[480px]"
        >
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              {data ? (
                <>
                  <div className="font-mono text-[12px] text-muted">#{data.leetcodeId}</div>
                  <h2 ref={head} tabIndex={-1} className="mt-1 text-[22px] leading-tight tracking-[-0.02em] outline-none">
                    {data.title}
                  </h2>
                </>
              ) : (
                <div className="grid gap-2 py-1">
                  <span className="skel h-3 w-12" />
                  <span className="skel h-6 w-64" />
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-icon -mr-2">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {error && <p className="text-[15px] text-muted">This question could not be loaded. Try again in a moment.</p>}
            {data && (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-soft">
                  <DifficultyBadge difficulty={data.difficulty} />
                  {data.acceptance > 0 && <span>{data.acceptance.toFixed(1)}% accepted</span>}
                  <span>
                    {data.companies.length} {data.companies.length === 1 ? "company" : "companies"}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(data, "solved")}
                    aria-pressed={!!p?.solved}
                    className={cn("btn btn-sm", p?.solved ? "btn-secondary" : "btn-primary")}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    {p?.solved ? "Solved" : "Mark solved"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(data, "bookmarked")}
                    aria-pressed={!!p?.bookmarked}
                    className="btn btn-secondary btn-sm"
                  >
                    <Bookmark className={cn("h-4 w-4", p?.bookmarked && "fill-current text-accent-text")} aria-hidden />
                    {p?.bookmarked ? "In your revision list" : "Save for revision"}
                  </button>
                  <a href={data.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    LeetCode
                  </a>
                </div>

                <h3 className="mt-8 mb-1 font-sans text-[14px] font-medium tracking-normal text-muted">
                  Asked by {data.companies.length} {data.companies.length === 1 ? "company" : "companies"}, most often first
                </h3>
                <p className="mb-3 text-[13px] text-muted">The marks show the recent windows it also appears in.</p>
                <ul className="divide-y divide-line border-t border-line">
                  {data.companies.map((c, i) => (
                    <li key={c.slug} className="grid grid-cols-[24px_minmax(0,9.5rem)_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-[14px]">
                      <Monogram name={c.name} slug={c.slug} size={24} />
                      <Link href={`/companies/${c.slug}`} className="truncate hover:underline hover:underline-offset-4">
                        {c.name}
                      </Link>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_9%,transparent)]" aria-hidden>
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${Math.max(4, (c.frequency / max) * 100)}%`,
                            background: i === 0 ? "var(--accent)" : "color-mix(in oklab, var(--ink) 50%, var(--bg))",
                          }}
                        />
                      </span>
                      <span className="flex gap-1">
                        {c.timeframes
                          .filter((t) => t !== "alltime")
                          .slice(0, 1)
                          .map((t) => (
                            <span key={t} className="chip h-5 px-1.5 text-[11px]">
                              {TF_SHORT[t]}
                            </span>
                          ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {!data && !error && (
              <div className="grid gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="skel h-8 w-full" />
                ))}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
