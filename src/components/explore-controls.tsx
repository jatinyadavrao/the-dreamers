"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shuffle, ExternalLink } from "lucide-react";
import { DifficultyBadge } from "./difficulty-badge";
import { prettifyCompany } from "@/lib/utils";
import type { CompanyLite, QuestionLite } from "@/lib/data";

export function CompanyFilter({ companies }: { companies: CompanyLite[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("company") ?? "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `/questions?company=${v}` : "/questions");
      }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-dream-400"
    >
      <option value="" className="bg-[var(--background)]">All companies</option>
      {companies.map((c) => (
        <option key={c.slug} value={c.slug} className="bg-[var(--background)]">
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function DailyChallenge({ question }: { question: QuestionLite | null }) {
  if (!question) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glow glass mb-8 rounded-2xl bg-gradient-to-br from-dream-500/10 to-nebula-500/10 p-6"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-nebula-400">
        <Shuffle className="h-4 w-4" /> Daily Challenge
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {question.leetcodeId}. {question.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="text-xs text-dream-300">{prettifyCompany(question.company)}</span>
          </div>
        </div>
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-dream-500 to-nebula-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          Solve now <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}
