import Link from "next/link";
import { Arrow } from "@/components/ui/arrow";
import { Reveal } from "@/components/ui/reveal";
import { LiquidType } from "@/components/fx/liquid-type";
import { HeroWindow } from "@/components/home/hero-window";
import { CompanyWall } from "@/components/home/company-wall";
import { CountUp } from "@/components/home/count-up";
import { SearchShowcase } from "@/components/home/search-showcase";
import { ScrollWords } from "@/components/home/scroll-words";
import { ChecklistCard } from "@/components/home/checklist-card";
import { CompareDiagram } from "@/components/home/compare-diagram";
import { DailyNotes } from "@/components/home/daily-notes";
import { PaletteDemo } from "@/components/home/palette-demo";
import { ActionBar } from "@/components/home/action-bar";
import { FALLBACK_SHOWCASE } from "@/components/home/fallback";
import { getFeaturedThought, getHomeShowcase, getStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HEADLINE = ["Company-wise", "LeetCode", "questions"];

function FeatureCard({ title, body, children }: { title: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="p-5 sm:p-7 lg:p-8">
        <h3 className="font-sans text-[18px] leading-snug font-medium tracking-[-0.01em] lg:text-[20px]">{title}</h3>
        <p className="mt-2 text-ink-soft lg:min-h-[2lh]">{body}</p>
      </div>
      <div className="mt-auto">{children}</div>
    </article>
  );
}

export default async function Home() {
  const [stats, showcase, thought, user] = await Promise.all([
    getStats().catch(() => null),
    getHomeShowcase().catch(() => null),
    getFeaturedThought().catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const data = showcase?.hero?.rows.length && showcase.open ? showcase : FALLBACK_SHOWCASE;
  const questions = stats?.questions ?? 0;
  const companies = stats?.companies ?? 0;
  const pair = data.pair ?? FALLBACK_SHOWCASE.pair!;
  const checklist = (data.hero?.rows ?? []).map((r) => r.title);
  const daily = data.daily ?? FALLBACK_SHOWCASE.daily!;
  const pastDays = data.mostAsked.map((q) => q.title).filter((t) => t !== daily.title).slice(0, 4);
  const palette = data.palette?.questions.length ? data.palette : FALLBACK_SHOWCASE.palette!;

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section
        aria-labelledby="hero-h"
        className="relative flex min-h-[calc(100svh-var(--nav))] flex-col pt-10 pb-8 lg:pt-12 lg:pb-12"
      >
        <div className="wrap flex flex-1 flex-col">
          <div className="mx-auto grid max-w-[880px] justify-items-center gap-4 text-center">
            <h1 id="hero-h" className="t-h1 max-w-[16ch]">
              {HEADLINE.map((w, i) => (
                <span key={w}>
                  <span className="enter-w">
                    <span style={{ ["--i" as string]: i }} className={i === 0 ? "whitespace-nowrap" : undefined}>
                      {w}
                    </span>
                  </span>
                  {i < HEADLINE.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p className="enter-up t-lead max-w-[52ch] text-ink-soft" style={{ ["--d" as string]: "200ms" }}>
              {questions && companies ? (
                <>
                  {formatNumber(questions)} questions asked by {formatNumber(companies)} companies, sorted by how often
                  each one comes up. Free forever.
                </>
              ) : (
                <>LeetCode questions grouped by the companies that ask them, sorted by how often each one comes up. Free forever.</>
              )}
            </p>
            <div className="enter-up mt-3 flex w-full justify-center max-sm:flex-col" style={{ ["--d" as string]: "260ms" }}>
              <Link id="hero-cta" href="/companies" className="btn btn-primary">
                Find your company
                <Arrow />
              </Link>
            </div>
          </div>
          <HeroWindow data={data} />
        </div>
      </section>

      {/* ---------------------------------------------------------- who is on it */}
      <section aria-labelledby="cos-h" className="border-y border-line py-10 lg:py-12">
        <div className="wrap mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="cos-h" className="font-sans text-[16px] font-normal tracking-normal text-ink-soft">
            {questions && companies ? (
              <>
                <CountUp value={questions} className="font-medium text-ink" /> questions from{" "}
                <CountUp value={companies} className="font-medium text-ink" /> companies, in four timeframes from the last
                six months to all time.
              </>
            ) : (
              <>Questions from the companies you are aiming for, in four timeframes.</>
            )}
          </h2>
          <Link href="/companies" className="link text-[15px]">
            See every company
            <Arrow />
          </Link>
        </div>
        <div className="wrap">
          <CompanyWall companies={data.topCompanies} />
        </div>
      </section>

      {/* ---------------------------------------------------------- one search */}
      <section id="questions" aria-labelledby="questions-h" className="pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 id="questions-h" className="t-h2">
                One search across every company
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="grid content-start justify-items-start gap-4 lg:col-span-6 lg:col-start-7">
              <p className="t-lead max-w-[60ch]">
                Type a keyword, then filter by difficulty and frequency. Open any question to see which companies ask
                it and save it for revision.
              </p>
              <Link href="/questions" className="link">
                See all questions
                <Arrow />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <SearchShowcase data={data} />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- statement */}
      <section id="smarter" aria-labelledby="smarter-h" className="py-12 lg:py-20">
        <div className="wrap grid gap-8">
          <LiquidType
            id="smarter-h"
            className="max-w-[14ch] text-[clamp(52px,9vw,150px)] leading-none tracking-[-0.035em] max-sm:text-[clamp(44px,14vw,84px)]"
          >
            <ScrollWords text="Practice smarter, not harder" />
          </LiquidType>
          <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <p className="t-lead max-w-[56ch] lg:col-span-6">
              Start with the questions your target company asks most. Then compare it with your second choice and study
              what they share.
            </p>
            {thought && (
              <figure className="grid gap-2 border-l-2 border-accent pl-5 lg:col-span-5 lg:col-start-8">
                <blockquote className="text-[20px] leading-snug tracking-[-0.02em] text-pretty lg:text-[22px]">
                  &ldquo;{thought.text}&rdquo;
                </blockquote>
                <figcaption className="text-[14px] text-ink-soft">
                  {thought.author}, in today&apos;s Suvichar.{" "}
                  <Link href="/suvichar" className="link text-[14px]">
                    See every Suvichar
                    <Arrow />
                  </Link>
                </figcaption>
              </figure>
            )}
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section id="features" aria-labelledby="features-h" className="py-12 lg:py-20">
        <div className="wrap">
          <Reveal>
            <h2 id="features-h" className="t-h2 mb-8 max-w-[780px] lg:mb-12">
              Track progress, compare companies, keep a streak.{" "}
              <span className="text-muted">Your ticks follow you to every list.</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-6">
            <Reveal>
              <FeatureCard title="Ticks off solved questions" body="Mark a question solved once and it shows solved on every list.">
                <ChecklistCard company={data.hero?.company ?? "Amazon"} items={checklist} />
              </FeatureCard>
            </Reveal>
            <Reveal delay={0.08}>
              <FeatureCard
                title="Compares two companies"
                body={
                  <>
                    Pick {pair.a} and {pair.b} and see the questions both of them ask.
                  </>
                }
              >
                <CompareDiagram a={pair.a} b={pair.b} shared={pair.shared} sharedCount={pair.sharedCount} />
              </FeatureCard>
            </Reveal>
            <Reveal>
              <FeatureCard title="A new question every day" body="Solve at least one question a day and your dashboard keeps your streak.">
                <DailyNotes today={daily} past={pastDays} />
              </FeatureCard>
            </Reveal>
            <Reveal delay={0.08}>
              <FeatureCard
                title="Jump anywhere from the keyboard"
                body={
                  <>
                    Press <span className="kbd">⌘K</span> or <span className="kbd">/</span> on any page, or tap Search, and type a
                    company, a question or a problem number.
                  </>
                }
              >
                <PaletteDemo palette={palette} />
              </FeatureCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- faq */}
      <section id="faq" aria-labelledby="faq-h" className="py-12 lg:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-6">
          <Reveal className="grid content-start justify-items-start gap-4 lg:col-span-4">
            <h2 id="faq-h" className="t-h2">
              Questions
            </h2>
            <p>About the lists, the account and the daily question.</p>
            <Link href="/about" className="link">
              Read about The Dreamers
              <Arrow />
            </Link>
          </Reveal>
          <div className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {[
              { q: "Is The Dreamers free?", a: "Yes, free forever. Every company list, filter and tracker is included." },
              { q: "Do I need an account to see the questions?", a: "Yes. Sign in with Google, or with an email and a password." },
              {
                q: "Which companies are on it?",
                a: `${companies ? formatNumber(companies) : "Two hundred"}, including Amazon, Google, Microsoft, Apple, Bloomberg, Uber and Goldman Sachs.`,
              },
              {
                q: "Is there a daily question?",
                a: "Yes. A new question is picked every day. Solve at least one question a day and your dashboard keeps your streak.",
              },
              {
                q: "How fresh are the lists?",
                a: "Each company has four timeframes: the last six months, one year, two years and all time. Pick one on its page.",
              },
              {
                q: "Can I see which companies ask a question?",
                a: "Yes. Open any question on the Questions page to see every company that asks it, most often first.",
              },
            ].map((f, i) => (
              <Reveal key={f.q} delay={(i % 2) * 0.06} className="grid content-start gap-2 border-t border-line py-6">
                <h3 className="font-sans text-[18px] leading-[1.4] font-medium tracking-normal">{f.q}</h3>
                <p className="max-w-[64ch] text-ink-soft">{f.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- close */}
      <section aria-labelledby="close-h" className="pt-4 pb-16 lg:pb-24">
        <div className="wrap">
          <Reveal>
            <div className="frame-lit relative grid min-h-[300px] content-center p-7 sm:p-10 lg:min-h-[340px] lg:p-14">
              <div className="relative z-10 grid max-w-[640px] justify-items-start gap-5">
                <h2 id="close-h" className="t-h2 text-ground-ink">
                  {user ? "Pick up where you left off" : "Start with your target company"}
                </h2>
                <p className="t-lead text-ink-soft">
                  {user
                    ? "Your solved questions, revision list and streak are on your dashboard."
                    : "Free forever. Sign in with Google or with your email."}
                </p>
                <Link
                  href={user ? "/dashboard" : "/companies"}
                  className="btn btn-stage h-12 px-6 text-[16px]"
                >
                  {user ? "Open your dashboard" : "Find your company"}
                  <Arrow />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ActionBar />
    </>
  );
}
