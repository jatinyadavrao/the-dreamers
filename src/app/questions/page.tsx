import { QuestionTable } from "@/components/question-table";
import { CompanyFilter, DailyChallenge } from "@/components/explore-controls";
import { Reveal } from "@/components/ui/reveal";
import { getCompanies, searchQuestions } from "@/lib/data";
import { dailyIndex } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Explore questions · The Dreamers" };

export default async function QuestionsPage({
  searchParams,
}: PageProps<"/questions">) {
  const sp = await searchParams;
  const company = (Array.isArray(sp.company) ? sp.company[0] : sp.company) ?? "";

  const [companies, questions] = await Promise.all([
    getCompanies().catch(() => []),
    searchQuestions({ company: company || undefined, limit: 600 }).catch(() => []),
  ]);

  const daily = questions.length ? questions[dailyIndex(questions.length)] : null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Explore <span className="text-gradient">questions</span>
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Search across every company. Filter, sort, and track as you go.
          </p>
        </div>
        <CompanyFilter companies={companies} />
      </Reveal>

      <DailyChallenge question={daily} />

      {questions.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">
          No questions yet. Run <code className="text-dream-300">npm run seed</code> to import data.
        </div>
      ) : (
        <QuestionTable questions={questions} showCompany />
      )}
    </section>
  );
}
