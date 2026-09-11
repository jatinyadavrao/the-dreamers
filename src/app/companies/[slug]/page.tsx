import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { QuestionTable } from "@/components/question-table";
import { CompanyCharts } from "@/components/company-charts";
import { Reveal } from "@/components/ui/reveal";
import {
  getCompany,
  getCompanyQuestions,
  getAvailableTimeframes,
} from "@/lib/data";
import {
  TIMEFRAME_LABELS,
  TIMEFRAMES,
  type Timeframe,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
  searchParams,
}: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const tfParam = (Array.isArray(sp.tf) ? sp.tf[0] : sp.tf) as Timeframe | undefined;
  const timeframe: Timeframe = TIMEFRAMES.includes(tfParam as Timeframe)
    ? (tfParam as Timeframe)
    : "alltime";

  const company = await getCompany(slug).catch(() => null);
  if (!company) notFound();

  const [questions, available] = await Promise.all([
    getCompanyQuestions(slug, timeframe),
    getAvailableTimeframes(slug),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Reveal>
        <Link href="/companies" className="text-sm text-[var(--muted)] hover:text-dream-300">
          ← All companies
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-dream-500/20 to-nebula-500/20 p-4 text-dream-300">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{company.name}</h1>
            <p className="text-sm text-[var(--muted)]">{company.questionCount} unique problems</p>
          </div>
        </div>
      </Reveal>

      {/* Timeframe switcher */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TIMEFRAMES.filter((tf) => available.includes(tf) || tf === "alltime").map((tf) => (
          <Link
            key={tf}
            href={`/companies/${slug}?tf=${tf}`}
            scroll={false}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              tf === timeframe
                ? "border-dream-400 bg-dream-500/15 text-dream-300"
                : "border-[var(--border)] text-[var(--muted)] hover:border-dream-400/50"
            )}
          >
            {TIMEFRAME_LABELS[tf]}
          </Link>
        ))}
      </div>

      {questions.length > 0 && (
        <div className="mt-8">
          <CompanyCharts questions={questions} />
        </div>
      )}

      <div className="mt-8">
        <QuestionTable questions={questions} />
      </div>
    </section>
  );
}
