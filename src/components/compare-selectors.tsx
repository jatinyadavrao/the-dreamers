"use client";

import { useRouter } from "next/navigation";
import { GitCompare } from "lucide-react";
import type { CompanyLite } from "@/lib/data";

export function CompareSelectors({
  companies,
  a,
  b,
}: {
  companies: CompanyLite[];
  a: string;
  b: string;
}) {
  const router = useRouter();
  const go = (na: string, nb: string) => {
    const p = new URLSearchParams();
    if (na) p.set("a", na);
    if (nb) p.set("b", nb);
    router.push(`/compare?${p.toString()}`);
  };

  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl p-4 sm:flex-row sm:justify-center">
      <Picker companies={companies} value={a} onChange={(v) => go(v, b)} placeholder="First company" />
      <GitCompare className="h-5 w-5 shrink-0 text-nebula-400" />
      <Picker companies={companies} value={b} onChange={(v) => go(a, v)} placeholder="Second company" />
    </div>
  );
}

function Picker({
  companies,
  value,
  onChange,
  placeholder,
}: {
  companies: CompanyLite[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-dream-400 sm:w-56"
    >
      <option value="" className="bg-[var(--background)]">{placeholder}</option>
      {companies.map((c) => (
        <option key={c.slug} value={c.slug} className="bg-[var(--background)]">
          {c.name}
        </option>
      ))}
    </select>
  );
}
