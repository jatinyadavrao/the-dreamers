import { AdminClient } from "@/components/admin/admin-client";
import { getCompanies, getThoughts, getProfile, getUserStats, getUsers } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin · The Dreamers" };

export default async function AdminPage() {
  const [companies, thoughts, profile, userStats, users] = await Promise.all([
    getCompanies().catch(() => []),
    getThoughts().catch(() => []),
    getProfile().catch(() => null),
    getUserStats().catch(() => ({ total: 0, verified: 0 })),
    getUsers().catch(() => []),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <AdminClient
        initialCompanies={companies}
        initialThoughts={thoughts}
        initialProfile={
          profile ?? { name: "", role: "", bio: "", avatarUrl: "", socials: {} }
        }
        userStats={userStats}
        users={users}
      />
    </section>
  );
}
