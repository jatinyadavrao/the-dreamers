import { DashboardClient } from "@/components/dashboard-client";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard · The Dreamers" };

export default async function DashboardPage() {
  await requireUser("/dashboard");
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <DashboardClient />
    </section>
  );
}
