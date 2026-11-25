import { Suspense } from "react";
import { CompanyGrid } from "@/components/company-grid";
import { EmptyState, PageHead } from "@/components/ui/kit";
import { CompanyGridSkeleton } from "@/components/ui/skeletons";
import { getCompanies, getCompanyProgress, getSolvedIds } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Companies" };

export default async function CompaniesPage() {
  // the guard runs before anything streams, so a signed-out visitor gets a real redirect
  const user = await requireUser("/companies");
  return (
    <section className="wrap pb-24">
      <PageHead title="Companies" lead="Every company, sorted by how many questions it asks. Open one to see its list." />
      <Suspense fallback={<CompanyGridSkeleton />}>
        <Companies userId={user.userId} />
      </Suspense>
    </section>
  );
}

async function Companies({ userId }: { userId: string }) {
  const [companies, solvedIds] = await Promise.all([
    getCompanies().catch(() => []),
    getSolvedIds(userId).catch(() => []),
  ]);
  const progress = await getCompanyProgress(solvedIds).catch(() => ({}));
  if (companies.length === 0) {
    return (
      <EmptyState
        title="No companies yet"
        body={
          <>
            Run <code className="font-mono text-ink">npm run seed</code> to import the question lists.
          </>
        }
      />
    );
  }
  return <CompanyGrid companies={companies} progress={progress} />;
}
