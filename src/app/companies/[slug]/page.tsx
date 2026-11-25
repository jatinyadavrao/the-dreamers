import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitCompareArrows } from "lucide-react";
import { QuestionTable } from "@/components/question-table";
import { CompanyCharts } from "@/components/company-charts";
import { Monogram } from "@/components/ui/kit";
import { CompanyBodySkeleton } from "@/components/ui/skeletons";
import { getCompany, getCompanyQuestions, getAvailableTimeframes } from "@/lib/data";
import { TIMEFRAME_LABELS, TIMEFRAMES, type Timeframe } from "@/lib/utils";
import { requireUser, withQuery } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = await getCompany(slug).catch(() => null);
  return { title: company ? `${company.name} questions` : "Company" };
}

export default async function CompanyPage({ params, searchParams }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireUser(withQuery(`/companies/${slug}`, sp, ["tf"]));
  const tfParam = (Array.isArray(sp.tf) ? sp.tf[0] : sp.tf) as Timeframe | undefined;
  const timeframe: Timeframe = TIMEFRAMES.includes(tfParam as Timeframe) ? (tfParam as Timeframe) : "alltime";

  const company = await getCompany(slug).catch(() => null);
  if (!company) notFound();

  const available = await getAvailableTimeframes(slug).catch(() => ["alltime"]);

  return (
    <section className="wrap pb-24">
      <div className="page-in grid gap-6 pt-10 pb-8 lg:pt-14">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-muted">
          <Link href="/companies" className="hover:text-ink">
            Companies
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink" aria-current="page">
            {company.name}
          </span>
        </nav>
        <div className="grid gap-6 lg:flex lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <Monogram name={company.name} slug={company.slug} size={56} />
            <div>
              <h1 className="text-[clamp(34px,2.4vw+22px,52px)] leading-[1.04] tracking-[-0.04em]">{company.name}</h1>
              <p className="mt-1 text-[15px] text-muted">
                {company.questionCount.toLocaleString("en-US")} questions across every timeframe
              </p>
            </div>
          </div>
          <Link href={`/compare?a=${company.slug}`} className="btn btn-secondary">
            <GitCompareArrows className="h-4 w-4" aria-hidden />
            Compare with another company
          </Link>
        </div>

        <nav aria-label="Timeframe" className="tabs">
          {TIMEFRAMES.filter((tf) => available.includes(tf) || tf === "alltime").map((tf) => (
            <Link
              key={tf}
              href={`/companies/${slug}?tf=${tf}`}
              scroll={false}
              aria-current={tf === timeframe ? "page" : undefined}
              className="tab"
            >
              {TIMEFRAME_LABELS[tf]}
            </Link>
          ))}
        </nav>
      </div>

      <Suspense key={timeframe} fallback={<CompanyBodySkeleton />}>
        <CompanyBody slug={slug} timeframe={timeframe} />
      </Suspense>
    </section>
  );
}

async function CompanyBody({ slug, timeframe }: { slug: string; timeframe: Timeframe }) {
  const questions = await getCompanyQuestions(slug, timeframe);
  return (
    <>
      {questions.length > 0 && (
        <div className="mb-8">
          <CompanyCharts questions={questions} />
        </div>
      )}
      <QuestionTable questions={questions} />
    </>
  );
}
