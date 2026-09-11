"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, ArrowRight } from "lucide-react";
import type { CompanyLite } from "@/lib/data";

export function CompanyGrid({ companies }: { companies: CompanyLite[] }) {
  const [q, setQ] = useState("");
  const filtered = companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="relative mx-auto mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search companies…"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3 pl-11 pr-4 outline-none focus:border-dream-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.4) }}
          >
            <Link
              href={`/companies/${c.slug}`}
              className="glass group flex h-full flex-col justify-between rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-dream-400/50"
            >
              <div className="mb-6 inline-flex w-fit rounded-xl bg-gradient-to-br from-dream-500/20 to-nebula-500/20 p-2.5 text-dream-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold leading-tight">{c.name}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>{c.questionCount} problems</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-[var(--muted)]">No companies found.</p>
      )}
    </div>
  );
}
