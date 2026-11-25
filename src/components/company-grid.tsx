"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Monogram } from "@/components/ui/kit";
import type { CompanyLite } from "@/lib/data";

type Sort = "count" | "name" | "progress";

export function CompanyGrid({
  companies,
  progress = {},
}: {
  companies: CompanyLite[];
  progress?: Record<string, number>;
}) {
  const [q, setQ] = useState("");
  const hasProgress = Object.keys(progress).length > 0;
  const [sort, setSort] = useState<Sort>("count");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const f = companies.filter((c) => !term || c.name.toLowerCase().includes(term) || c.slug.includes(term));
    if (sort === "name") return [...f].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "progress")
      return [...f].sort(
        (a, b) =>
          (progress[b.slug] ?? 0) / Math.max(1, b.questionCount) - (progress[a.slug] ?? 0) / Math.max(1, a.questionCount) ||
          b.questionCount - a.questionCount
      );
    return f;
  }, [companies, q, sort, progress]);

  const tabs: { key: Sort; label: string }[] = [
    { key: "count", label: "Most questions" },
    { key: "name", label: "A to Z" },
    ...(hasProgress ? [{ key: "progress" as const, label: "Your progress" }] : []),
  ];

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:flex sm:items-center sm:justify-between">
        <label className="field sm:w-[360px]">
          <Search aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" aria-label="Search companies" />
        </label>
        <div className="tabs" role="tablist" aria-label="Sort companies">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={sort === t.key} onClick={() => setSort(t.key)} className="tab">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-[13px] text-muted" aria-live="polite">
        {list.length === companies.length ? `${companies.length} companies` : `${list.length} of ${companies.length} companies`}
      </p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c) => {
          const solved = progress[c.slug] ?? 0;
          const pct = c.questionCount ? Math.min(100, (solved / c.questionCount) * 100) : 0;
          return (
            <li key={c.slug}>
              <Link
                href={`/companies/${c.slug}`}
                className="card card-hover group grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-3 p-4"
              >
                <Monogram name={c.name} slug={c.slug} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">{c.name}</span>
                  <span className="block text-[13px] text-muted">
                    {c.questionCount.toLocaleString("en-US")} questions
                    {solved > 0 && <> · {solved} solved</>}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-muted opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden
                />
                {solved > 0 && (
                  <span className="col-span-3 h-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)]" aria-hidden>
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(2, pct)}%` }} />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && <p className="py-16 text-center text-muted">No company matches &ldquo;{q}&rdquo;.</p>}
    </div>
  );
}
