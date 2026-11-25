"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import type { CompanyLite } from "@/lib/data";

const PAIRS: [string, string][] = [
  ["amazon", "google"],
  ["google", "facebook"],
  ["microsoft", "amazon"],
  ["apple", "google"],
  ["uber", "lyft"],
  ["goldman-sachs", "morgan-stanley"],
];

export function CompareSelectors({ companies, a, b }: { companies: CompanyLite[]; a: string; b: string }) {
  const router = useRouter();
  const go = (na: string, nb: string) => {
    const p = new URLSearchParams();
    if (na) p.set("a", na);
    if (nb) p.set("b", nb);
    router.push(`/compare?${p.toString()}`);
  };
  const name = new Map(companies.map((c) => [c.slug, c.name]));
  const pairs = PAIRS.filter(([x, y]) => name.has(x) && name.has(y));

  return (
    <div className="grid gap-5">
      <div className="card grid items-end gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:p-5">
        <Picker label="First company" companies={companies} value={a} onChange={(v) => go(v, b)} />
        <button
          type="button"
          onClick={() => go(b, a)}
          disabled={!a && !b}
          aria-label="Swap the two companies"
          className="btn btn-secondary btn-icon h-11 w-11 justify-self-center"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden />
        </button>
        <Picker label="Second company" companies={companies} value={b} onChange={(v) => go(a, v)} />
      </div>
      {pairs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <span className="mr-1 text-muted">Often compared:</span>
          {pairs.map(([x, y]) => (
            <Link
              key={`${x}-${y}`}
              href={`/compare?a=${x}&b=${y}`}
              aria-current={a === x && b === y ? "page" : undefined}
              className="tab h-8 px-3 text-[13px]"
            >
              {name.get(x)} and {name.get(y)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Picker({
  label,
  companies,
  value,
  onChange,
}: {
  label: string;
  companies: CompanyLite[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-[13px] text-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="select text-ink">
        <option value="">Choose a company</option>
        {companies.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name} ({c.questionCount})
          </option>
        ))}
      </select>
    </label>
  );
}
