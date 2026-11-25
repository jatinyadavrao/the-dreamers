import { Suspense } from "react";
import { ExploreClient } from "@/components/explore/explore-client";
import { EmptyState, PageHead } from "@/components/ui/kit";
import { TableSkeleton } from "@/components/ui/skeletons";
import { getCompanies, getExploreQuestions, pickDaily, searchQuestions, type ExploreQuestion } from "@/lib/data";
import { requireUser, withQuery } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Questions" };

export default async function QuestionsPage({ searchParams }: PageProps<"/questions">) {
  const sp = await searchParams;
  await requireUser(withQuery("/questions", sp, ["company", "open"]));
  const company = (Array.isArray(sp.company) ? sp.company[0] : sp.company) ?? "";
  return (
    <section className="wrap pb-24">
      <Suspense
        key={company}
        fallback={
          <div role="status" aria-label="Loading">
            <PageHead title="Questions" lead="Every question across every company, most widely asked first." />
            <span className="skel mb-10 block h-[176px] rounded-[8px]" aria-hidden />
            <TableSkeleton />
          </div>
        }
      >
        <Questions company={company} />
      </Suspense>
    </section>
  );
}

async function Questions({ company }: { company: string }) {
  const [companies, all] = await Promise.all([getCompanies().catch(() => []), getExploreQuestions().catch(() => [])]);
  const known = companies.some((c) => c.slug === company);

  let questions: ExploreQuestion[] = all;
  if (company && known) {
    // one company's list, each row still telling how many companies ask it
    const counts = new Map(all.map((q) => [q.leetcodeId, q.companyCount]));
    const rows = await searchQuestions({ company, limit: 2000 }).catch(() => []);
    questions = rows.map((r) => ({ ...r, companyCount: counts.get(r.leetcodeId) ?? 1 }));
  }
  // today's question: the same pick for everyone, among the most widely asked (or the company's own)
  const daily = pickDaily(company && known ? questions : all.slice(0, 600));

  return (
    <>
      <PageHead
        title="Questions"
        lead={
          all.length
            ? `Every question across ${companies.length} companies, most widely asked first. Open one to see which companies ask it.`
            : undefined
        }
      />
      {all.length === 0 ? (
        <EmptyState
          title="No questions yet"
          body={
            <>
              Run <code className="font-mono text-ink">npm run seed</code> to import the question lists.
            </>
          }
        />
      ) : (
        <Suspense>
          <ExploreClient questions={questions} companies={companies} company={known ? company : ""} daily={daily} />
        </Suspense>
      )}
    </>
  );
}
