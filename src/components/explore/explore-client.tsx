"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ExternalLink, Flame } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { QuestionTable } from "@/components/question-table";
import { QuestionDrawer } from "@/components/explore/question-drawer";
import { useProgress, useToggleProgress } from "@/lib/progress-store";
import { countByDay, streaks } from "@/lib/streak";
import type { CompanyLite, ExploreQuestion } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ExploreClient({
  questions,
  companies,
  company,
  daily,
}: {
  questions: ExploreQuestion[];
  companies: CompanyLite[];
  company: string;
  daily: ExploreQuestion | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [openId, setOpenId] = useState<number | null>(() => {
    const v = Number(sp.get("open"));
    return Number.isInteger(v) && v > 0 ? v : null;
  });

  // keep ?open= in the address, so an open question can be shared or reloaded
  const sync = useCallback((id: number | null) => {
    const url = new URL(window.location.href);
    if (id == null) url.searchParams.delete("open");
    else url.searchParams.set("open", String(id));
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  const open = useCallback(
    (id: number) => {
      setOpenId(id);
      sync(id);
    },
    [sync]
  );
  const close = useCallback(() => {
    setOpenId(null);
    sync(null);
  }, [sync]);

  // the palette navigates here with ?open=; follow it while on the page
  const spOpen = sp.get("open");
  const [lastOpen, setLastOpen] = useState(spOpen);
  if (spOpen !== lastOpen) {
    setLastOpen(spOpen);
    const v = Number(spOpen);
    if (Number.isInteger(v) && v > 0) setOpenId(v);
  }

  // on a wide screen the list makes room for the drawer instead of sitting under it
  useEffect(() => {
    document.documentElement.classList.toggle("drawer-open", openId != null);
    return () => document.documentElement.classList.remove("drawer-open");
  }, [openId]);

  const current = companies.find((c) => c.slug === company);

  return (
    <>
      {daily && <DailyCard q={daily} onOpen={() => open(daily.leetcodeId)} companyName={current?.name} />}

      <div className="mt-10 mb-5 flex flex-wrap items-end justify-between gap-4">
        <h2 className="t-h3">{current ? `${current.name}'s questions` : "Every question"}</h2>
        <label className="grid gap-1.5 text-[13px] text-muted">
          Company
          <select
            value={company}
            onChange={(e) => {
              const v = e.target.value;
              router.push(v ? `/questions?company=${v}` : "/questions");
            }}
            className="select select-sm w-[240px] text-ink"
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <QuestionTable
        questions={questions}
        mode="explore"
        onOpen={(r) => open(r.leetcodeId)}
        openId={openId}
      />

      <QuestionDrawer id={openId} onClose={close} />
    </>
  );
}

function DailyCard({ q, onOpen, companyName }: { q: ExploreQuestion; onOpen: () => void; companyName?: string }) {
  const { isSignedIn } = useAuth();
  const progress = useProgress(isSignedIn);
  const toggle = useToggleProgress();
  const p = progress[q.leetcodeId];
  const s = useMemo(() => streaks(countByDay(Object.values(progress).map((e) => (e.solved ? e.solvedAt : null)))), [progress]);

  return (
    <section id="daily" aria-labelledby="daily-h" className="frame-lit @container scroll-mt-24 p-6 sm:p-8">
      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-end">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-ground-muted">
            <span id="daily-h" className="font-medium text-ground-ink">
              Today&apos;s question{companyName ? ` at ${companyName}` : ""}
            </span>
            <span aria-hidden>·</span>
            <span>A new one every day</span>
          </div>
          <button type="button" onClick={onOpen} className="text-left">
            <span className="block text-[clamp(26px,1.6vw+18px,36px)] leading-tight tracking-[-0.03em] hover:underline hover:decoration-[color-mix(in_oklab,var(--ground-ink)_35%,transparent)] hover:underline-offset-[6px]">
              {q.title}
            </span>
          </button>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ground-muted [--ink-soft:var(--ground-ink)]">
            <DifficultyBadge difficulty={q.difficulty} />
            {q.acceptance > 0 && <span>{q.acceptance.toFixed(1)}% accepted</span>}
            <span>Asked by {q.companyCount} companies</span>
          </div>
        </div>
        <div className="grid gap-3 @lg:flex @lg:flex-wrap @lg:items-center">
          {isSignedIn && (
            <span className="inline-flex items-center gap-2 text-[14px] text-ground-ink">
              <Flame className={cn("h-4 w-4", s.today ? "text-[#c2410c]" : "text-ground-muted")} aria-hidden />
              {s.current > 0 ? `${s.current}-day streak` : "Start a streak today"}
            </span>
          )}
          <button
            type="button"
            onClick={() => toggle(q, "solved")}
            aria-pressed={!!p?.solved}
            className="btn h-11 border-[color-mix(in_oklab,var(--ground-ink)_24%,transparent)] bg-transparent text-ground-ink hover:bg-[color-mix(in_oklab,var(--ground-ink)_7%,transparent)]"
          >
            <Check className="h-4 w-4" aria-hidden />
            {p?.solved ? "Solved" : "Mark solved"}
          </button>
          <a
            href={q.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn h-11 bg-ground-ink text-ground-surface hover:bg-[color-mix(in_oklab,var(--ground-ink)_88%,var(--ground-bg))]"
          >
            Solve on LeetCode
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
