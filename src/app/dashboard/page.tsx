import { Suspense } from "react";
import { DashboardClient, type Coverage } from "@/components/dashboard-client";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { requireUser } from "@/lib/auth";
import { getCompanies, getCompanyProgress, getSolvedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  return (
    <section className="wrap">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard userId={user.userId} />
      </Suspense>
    </section>
  );
}

async function Dashboard({ userId }: { userId: string }) {
  const [ids, companies] = await Promise.all([getSolvedIds(userId).catch(() => []), getCompanies().catch(() => [])]);
  const solvedBy = await getCompanyProgress(ids).catch(() => ({} as Record<string, number>));
  const coverage: Coverage = companies
    .filter((c) => solvedBy[c.slug])
    .map((c) => ({ slug: c.slug, name: c.name, solved: solvedBy[c.slug], total: c.questionCount }))
    .sort((a, b) => b.solved - a.solved || b.solved / b.total - a.solved / a.total)
    .slice(0, 6);

  return <DashboardClient coverage={coverage} />;
}
