import { DashboardClient } from "@/components/dashboard-client";

export const metadata = { title: "Dashboard · The Dreamers" };

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <DashboardClient />
    </section>
  );
}
