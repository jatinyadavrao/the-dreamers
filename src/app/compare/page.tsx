import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CompareSelectors } from "@/components/compare-selectors";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { QuestionTable } from "@/components/question-table";
import { Monogram, PageHead } from "@/components/ui/kit";
import { Arrow } from "@/components/ui/arrow";
import { TableSkeleton } from "@/components/ui/skeletons";
import { getCompanies, compareCompanies } from "@/lib/data";
import type { CompanyLite, QuestionLite } from "@/lib/data";
import { requireUser, withQuery } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Compare companies" };

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  await requireUser(withQuery("/compare", sp, ["a", "b"]));
  const a = (Array.isArray(sp.a) ? sp.a[0] : sp.a) ?? "";
  const b = (Array.isArray(sp.b) ? sp.b[0] : sp.b) ?? "";
  return (
    <section className="wrap pb-24">
      <PageHead
        title="Compare companies"
        lead="Pick two companies and see the questions both of them ask. Study the overlap first, then each one's own list."
      />
      <Suspense
        key={`${a}|${b}`}
        fallback={
          <div role="status" aria-label="Loading" className="grid gap-10">
            <span className="skel block h-[110px] rounded-[8px]" aria-hidden />
            {a && b && <TableSkeleton />}
          </div>
        }
      >
        <Comparison a={a} b={b} />
      </Suspense>
    </section>
  );
}

async function Comparison({ a, b }: { a: string; b: string }) {
  const companies = await getCompanies().catch(() => []);
  const ca = companies.find((c) => c.slug === a) ?? null;
  const cb = companies.find((c) => c.slug === b) ?? null;
  const both = !!ca && !!cb && a !== b;
  const result = both ? await compareCompanies(a, b).catch(() => null) : null;

  return (
    <>
      <CompareSelectors companies={companies} a={ca ? a : ""} b={cb ? b : ""} />

      {a && b && a === b && <p className="mt-10 text-center text-muted">Pick two different companies.</p>}

      {both && result && ca && cb && (
        <div className="mt-10 grid grid-cols-1 gap-12">
          <Overlap a={ca} b={cb} shared={result.shared.length} onlyA={result.onlyA.length} onlyB={result.onlyB.length} />

          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="t-h3">Asked by both ({result.shared.length})</h2>
              <p className="text-[14px] text-muted">Sorted by how often {ca.name} asks each one.</p>
            </div>
            <QuestionTable
              questions={result.shared}
              emptyHint={`${ca.name} and ${cb.name} share no questions in this dataset.`}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <OnlyList company={ca} questions={result.onlyA} />
            <OnlyList company={cb} questions={result.onlyB} />
          </div>
        </div>
      )}

      {!both && !(a && b && a === b) && (
        <p className="mt-12 text-center text-[15px] text-muted">
          Choose two companies above to see their overlap, or{" "}
          <Link href="/companies" className="link">
            browse every company
          </Link>
          .
        </p>
      )}
    </>
  );
}

/** One whole: A's own, the shared part (the accent: it is the point), B's own. */
function Overlap({ a, b, shared, onlyA, onlyB }: { a: CompanyLite; b: CompanyLite; shared: number; onlyA: number; onlyB: number }) {
  const total = shared + onlyA + onlyB;
  const parts = [
    { key: "a", label: `Only ${a.name}`, n: onlyA, color: "color-mix(in oklab, var(--ink) 30%, var(--surface))", on: "var(--ink)" },
    { key: "s", label: "Asked by both", n: shared, color: "var(--accent)", on: "var(--accent-ink)" },
    { key: "b", label: `Only ${b.name}`, n: onlyB, color: "color-mix(in oklab, var(--ink) 18%, var(--surface))", on: "var(--ink)" },
  ];
  const pctA = a.questionCount ? Math.round((shared / (shared + onlyA)) * 100) : 0;
  const pctB = b.questionCount ? Math.round((shared / (shared + onlyB)) * 100) : 0;
  return (
    <section aria-labelledby="overlap-h" className="card grid gap-6 p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2">
          <Monogram name={a.name} slug={a.slug} size={32} />
          <span className="font-medium">{a.name}</span>
        </span>
        <span className="text-muted">and</span>
        <span className="flex items-center gap-2">
          <Monogram name={b.name} slug={b.slug} size={32} />
          <span className="font-medium">{b.name}</span>
        </span>
      </div>
      <div className="grid gap-x-10 gap-y-4 sm:grid-cols-3">
        <div>
          <div id="overlap-h" className="text-[14px] text-muted">
            Questions in common
          </div>
          <div className="mt-1 text-[40px] leading-none font-medium tracking-[-0.03em]">{shared}</div>
        </div>
        <div>
          <div className="text-[14px] text-muted">Share of {a.name}&apos;s list</div>
          <div className="mt-1 text-[40px] leading-none font-medium tracking-[-0.03em]">{pctA}%</div>
        </div>
        <div>
          <div className="text-[14px] text-muted">Share of {b.name}&apos;s list</div>
          <div className="mt-1 text-[40px] leading-none font-medium tracking-[-0.03em]">{pctB}%</div>
        </div>
      </div>
      <div
        role="img"
        aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}
        className="flex h-7 gap-[2px]"
      >
        {parts
          .filter((p) => p.n > 0)
          .map((p) => (
            <span
              key={p.key}
              className="flex min-w-[3px] items-center rounded-[4px] px-2"
              style={{ flexGrow: p.n, flexBasis: 0, background: p.color }}
              title={`${p.label}: ${p.n}`}
            >
              {p.n / total >= 0.08 && (
                <span className="tnum text-[12px] font-semibold" style={{ color: p.on }}>
                  {p.n}
                </span>
              )}
            </span>
          ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-soft">
        {parts.map((p) => (
          <li key={p.key} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: p.color }} aria-hidden />
            {p.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OnlyList({ company, questions }: { company: CompanyLite; questions: QuestionLite[] }) {
  const top = questions.slice(0, 40);
  return (
    <section aria-label={`Only ${company.name}`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="t-h3">
          Only {company.name} <span className="text-muted">({questions.length})</span>
        </h2>
        <Link href={`/companies/${company.slug}`} className="link text-[14px]">
          Full list
          <Arrow />
        </Link>
      </div>
      <ul className="card max-h-[520px] divide-y divide-line overflow-y-auto">
        {top.length === 0 && <li className="p-4 text-[14px] text-muted">None.</li>}
        {top.map((q) => (
          <li key={q.leetcodeId}>
            <a
              href={q.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_3.5%,transparent)]"
            >
              <span className="min-w-0 truncate text-[14px]">
                <span className="mr-2 font-mono text-[12px] text-muted">{q.leetcodeId}</span>
                {q.title}
              </span>
              <span className="flex flex-none items-center gap-3">
                <DifficultyBadge difficulty={q.difficulty} />
                <ExternalLink className="h-3.5 w-3.5 text-muted" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>
      {questions.length > 40 && (
        <p className="mt-3 text-[13px] text-muted">Showing the 40 {company.name} asks most often.</p>
      )}
    </section>
  );
}
