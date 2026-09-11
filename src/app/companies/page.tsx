import { CompanyGrid } from "@/components/company-grid";
import { Reveal } from "@/components/ui/reveal";
import { getCompanies } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Companies · The Dreamers" };

export default async function CompaniesPage() {
  const companies = await getCompanies().catch(() => []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <Reveal className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Pick your <span className="text-gradient">dream company</span>
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          {companies.length} companies · sorted by how many questions we&apos;ve got.
        </p>
      </Reveal>

      {companies.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">
          No companies yet. Run <code className="text-dream-300">npm run seed</code> to import data.
        </div>
      ) : (
        <CompanyGrid companies={companies} />
      )}
    </section>
  );
}
