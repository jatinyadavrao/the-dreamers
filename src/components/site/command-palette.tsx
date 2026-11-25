"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, CornerDownLeft, Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import type { SearchResult } from "@/lib/data";
import { cn } from "@/lib/utils";

const EVENT = "td:palette";

/** Open the palette from anywhere (the header's search button). */
export function openPalette() {
  window.dispatchEvent(new Event(EVENT));
}

type Item = { key: string; href: string; label: string; meta?: string; kind: "page" | "company" | "question"; difficulty?: string };

const PAGES: Item[] = [
  { key: "p-companies", href: "/companies", label: "Companies", meta: "Every company list", kind: "page" },
  { key: "p-questions", href: "/questions", label: "Questions", meta: "Search across every company", kind: "page" },
  { key: "p-compare", href: "/compare", label: "Compare", meta: "Two companies side by side", kind: "page" },
  { key: "p-dashboard", href: "/dashboard", label: "Dashboard", meta: "Your progress and revision list", kind: "page" },
  { key: "p-suvichar", href: "/suvichar", label: "Suvichar", meta: "The daily thought", kind: "page" },
];

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

export function CommandPalette() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ term: string; data: SearchResult | null; limited?: boolean } | null>(null);
  const term = q.trim();
  const res = result && result.term === term ? result.data : null;
  const loading = open && isSignedIn && !!term && (!result || result.term !== term);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    setQ("");
    setResult(null);
    setActive(0);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onOpen = () => show();
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) hide();
        else show();
      } else if (e.key === "/" && !open && !typing(e.target)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener(EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, show, hide]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  // search as you type (signed in only: the lists are behind sign-in)
  useEffect(() => {
    if (!open || !isSignedIn || !term) return;
    const ctl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then(async (r) => ({ limited: r.status === 429, data: r.ok ? ((await r.json()) as SearchResult) : null }))
        .then(({ limited, data }) => {
          setResult({ term, data, limited });
          setActive(0);
        })
        .catch(() => {});
    }, 140);
    return () => {
      ctl.abort();
      window.clearTimeout(t);
    };
  }, [term, open, isSignedIn]);

  const items: Item[] = useMemo(() => {
    const t = term.toLowerCase();
    const pages = PAGES.filter((p) => (isSignedIn || p.href !== "/dashboard") && (!t || p.label.toLowerCase().includes(t)));
    if (!res) return pages;
    return [
      ...res.companies.map((c) => ({
        key: `c-${c.slug}`,
        href: `/companies/${c.slug}`,
        label: c.name,
        meta: `${c.questionCount} questions`,
        kind: "company" as const,
      })),
      ...res.questions.map((x) => ({
        key: `q-${x.leetcodeId}`,
        href: `/questions?open=${x.leetcodeId}`,
        label: `${x.leetcodeId}. ${x.title}`,
        meta: `${x.companyCount} ${x.companyCount === 1 ? "company" : "companies"}`,
        kind: "question" as const,
        difficulty: x.difficulty,
      })),
      ...pages,
    ];
  }, [res, term, isSignedIn]);

  const go = (it: Item | undefined) => {
    if (!it) return;
    hide();
    router.push(it.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "Tab") {
      // keep focus in the dialog: the input is its one stop
      e.preventDefault();
    }
  };

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const groups: { title: string; kind: Item["kind"] }[] = [
    { title: "Companies", kind: "company" },
    { title: "Questions", kind: "question" },
    { title: "Pages", kind: "page" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid items-start justify-items-center bg-[rgb(10_10_11/0.55)] px-4 pt-[12vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) hide();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            className="card w-full max-w-[620px] overflow-hidden shadow-[0_24px_64px_-24px_rgb(0_0_0/0.6)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex h-14 items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 flex-none text-muted" aria-hidden />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isSignedIn ? "Search companies, questions or a problem number" : "Jump to a page"}
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={items[active] ? `pal-${items[active].key}` : undefined}
                className="h-full flex-1 bg-transparent text-[16px] outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {loading && <span className="ui-spin text-muted" aria-hidden />}
              <span className="kbd">esc</span>
            </div>

            <div ref={list} id="palette-list" role="listbox" className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
              {!isSignedIn && (
                <div className="mx-2 mt-1 mb-3 flex items-center justify-between gap-3 rounded-[6px] border border-line bg-bg px-3 py-3 text-[14px]">
                  <span className="text-ink-soft">Sign in to search every company and question.</span>
                  <Link href="/sign-in" onClick={hide} className="btn btn-primary btn-xs">
                    Sign in
                  </Link>
                </div>
              )}
              {groups.map((g) => {
                const rows = items.map((it, i) => ({ it, i })).filter((x) => x.it.kind === g.kind);
                if (!rows.length) return null;
                return (
                  <div key={g.kind} className="mb-1">
                    <div className="px-3 pt-2 pb-1.5 text-[12px] font-medium text-muted">{g.title}</div>
                    {rows.map(({ it, i }) => (
                      <button
                        key={it.key}
                        id={`pal-${it.key}`}
                        data-i={i}
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        tabIndex={-1}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(it)}
                        className={cn(
                          "flex h-11 w-full items-center gap-3 rounded-[4px] px-3 text-left text-[14px]",
                          i === active ? "bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]" : ""
                        )}
                      >
                        {it.kind === "company" ? (
                          <Building2 className="h-4 w-4 flex-none text-muted" aria-hidden />
                        ) : it.kind === "question" ? (
                          <span className={`diff diff-${(it.difficulty ?? "medium").toLowerCase()} w-4 flex-none !gap-0`} aria-hidden />
                        ) : (
                          <ArrowRight className="h-4 w-4 flex-none text-muted" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 truncate">{it.label}</span>
                        {it.meta && <span className="flex-none text-[13px] text-muted">{it.meta}</span>}
                        {i === active && <CornerDownLeft className="h-3.5 w-3.5 flex-none text-muted" aria-hidden />}
                      </button>
                    ))}
                  </div>
                );
              })}
              {isSignedIn && result?.term === term && result.limited && (
                <p className="px-3 py-8 text-center text-[14px] text-muted">Too many searches in a minute. Wait a moment and type again.</p>
              )}
              {isSignedIn && q.trim() && res && !res.companies.length && !res.questions.length && (
                <p className="px-3 py-8 text-center text-[14px] text-muted">Nothing matches &ldquo;{q.trim()}&rdquo;.</p>
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> to move
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="kbd">↵</span> to open
              </span>
              <span className="ml-auto hidden sm:inline">
                <span className="kbd">⌘K</span> or <span className="kbd">/</span> from anywhere
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
