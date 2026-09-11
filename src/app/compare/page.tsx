import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CompareSelectors } from "@/components/compare-selectors";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Reveal } from "@/components/ui/reveal";
import { getCompanies, getCompany, compareCompanies } from "@/lib/data";
import { prettifyCompany } from "@/lib/utils";
import type { QuestionLite } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Compare companies · The Dreamers" };

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  await requireUser("/compare");
  const sp = await searchParams;
  const a = (Array.isArray(sp.a) ? sp.a[0] : sp.a) ?? "";
  const b = (Array.isArray(sp.b) ? sp.b[0] : sp.b) ?? "";

  const companies = await getCompanies().catch(() => []);
  const both = a && b && a !== b;
  const [ca, cb, result] = both
    ? await Promise.all([getCompany(a), getCompany(b), compareCompanies(a, b)])
    : [null, null, null];

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Reveal className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Compare <span className="text-gradient">companies</span>
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Find the problems two companies both ask — study the overlap first.
        </p>
      </Reveal>

      <CompareSelectors companies={companies} a={a} b={b} />

      {a && b && a === b && (
        <p className="mt-8 text-center text-[var(--muted)]">Pick two different companies.</p>
      )}

      {both && result && (
        <div className="mt-10 space-y-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat label={ca?.name ?? prettifyCompany(a)} value={result.countA} sub="problems" />
            <Stat label="Shared" value={result.shared.length} sub="in common" highlight />
            <Stat label={cb?.name ?? prettifyCompany(b)} value={result.countB} sub="problems" />
          </div>

          <QuestionColumn
            title={`Asked by both (${result.shared.length})`}
            questions={result.shared}
            accent
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <QuestionColumn title={`Only ${ca?.name} (${result.onlyA.length})`} questions={result.onlyA.slice(0, 40)} />
            <QuestionColumn title={`Only ${cb?.name} (${result.onlyB.length})`} questions={result.onlyB.slice(0, 40)} />
          </div>
        </div>
      )}

      {!both && (
        <p className="mt-10 text-center text-sm text-[var(--muted)]">
          Choose two companies above to see their overlap.{" "}
          <Link href="/companies" className="text-dream-300 hover:underline">Browse companies</Link>
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: number; sub: string; highlight?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-5 ${highlight ? "glow bg-gradient-to-br from-dream-500/10 to-nebula-500/10" : ""}`}>
      <div className="font-display text-3xl font-bold text-gradient">{value}</div>
      <div className="mt-1 truncate text-sm font-medium">{label}</div>
      <div className="text-xs text-[var(--muted)]">{sub}</div>
    </div>
  );
}

function QuestionColumn({ title, questions, accent }: { title: string; questions: QuestionLite[]; accent?: boolean }) {
  return (
    <div>
      <h3 className={`mb-3 font-display font-semibold ${accent ? "text-nebula-400" : ""}`}>{title}</h3>
      <div className="glass max-h-[420px] divide-y divide-[var(--border)] overflow-y-auto rounded-2xl">
        {questions.length === 0 && <p className="p-4 text-sm text-[var(--muted)]">None.</p>}
        {questions.map((q) => (
          <a
            key={q.leetcodeId}
            href={q.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-dream-500/5"
          >
            <span className="min-w-0 truncate text-sm">
              <span className="mr-1.5 text-xs text-[var(--muted)]">{q.leetcodeId}.</span>
              {q.title}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <DifficultyBadge difficulty={q.difficulty} />
              <ExternalLink className="h-3.5 w-3.5 text-[var(--muted)]" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
