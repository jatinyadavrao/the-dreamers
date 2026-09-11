import Link from "next/link";
import {
  Building2,
  Search,
  GitCompare,
  CheckCircle2,
  Bookmark,
  Shuffle,
  Quote,
  ArrowRight,
} from "lucide-react";
import { HeroTitle, CompanyMarquee } from "@/components/home";
import { Reveal } from "@/components/ui/reveal";
import { getCompanies, getStats, getFeaturedThought } from "@/lib/data";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Building2, title: "Company-wise sets", desc: "Questions grouped by company and timeframe, sorted by how often they're asked." },
  { icon: Search, title: "Powerful search", desc: "Filter across every company by difficulty, frequency and keywords instantly." },
  { icon: CheckCircle2, title: "Progress tracking", desc: "Tick off what you solve. Your progress follows you across every list." },
  { icon: Bookmark, title: "Revision list", desc: "Bookmark tricky problems and build a personal revision playlist." },
  { icon: GitCompare, title: "Compare companies", desc: "See which problems Amazon and Google both love — study the overlap first." },
  { icon: Shuffle, title: "Daily challenge", desc: "A fresh problem picked for you every day. Keep the streak alive." },
];

export default async function Home() {
  const [companies, stats, thought] = await Promise.all([
    getCompanies().catch(() => []),
    getStats().catch(() => ({ companies: 0, questions: 0 })),
    getFeaturedThought().catch(() => null),
  ]);
  const top = companies.slice(0, 24).map((c) => c.name);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-28">
        <HeroTitle />
        <CompanyMarquee names={top} />

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
          {[
            [stats.companies || "150+", "Companies"],
            [stats.questions || "1000+", "Questions"],
            ["100%", "Free forever"],
          ].map(([v, l], i) => (
            <Reveal key={l} delay={i * 0.1}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{v}</div>
                <div className="mt-1 text-xs text-[var(--muted)] sm:text-sm">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Everything you need to <span className="text-gradient">crack the interview</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.1}>
              <div className="glass group h-full rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-dream-500/20 to-nebula-500/20 p-3 text-dream-300 transition-transform group-hover:scale-110">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured thought */}
      {thought && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
              <Quote className="mx-auto mb-4 h-8 w-8 text-nebula-400" />
              <p className="font-display text-xl font-medium leading-relaxed sm:text-2xl">
                “{thought.text}”
              </p>
              <p className="mt-4 text-sm text-[var(--muted)]">— {thought.author}</p>
              <Link href="/suvichar" className="mt-6 inline-flex items-center gap-1 text-sm text-dream-300 hover:underline">
                More daily thoughts <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <div className="glow glass rounded-3xl bg-gradient-to-br from-dream-500/10 to-nebula-500/10 p-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to start dreaming big?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Pick your target company and start solving the exact problems they ask.
            </p>
            <Link
              href="/companies"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-dream-500 to-nebula-500 px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
