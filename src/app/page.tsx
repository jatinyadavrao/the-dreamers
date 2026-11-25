import Link from "next/link";
import { Arrow } from "@/components/ui/arrow";
import { LiquidType } from "@/components/fx/liquid-type";
import { HeroWindow } from "@/components/home/hero-window";
import { SearchShowcase } from "@/components/home/search-showcase";
import { ChecklistCard } from "@/components/home/checklist-card";
import { CompareDiagram } from "@/components/home/compare-diagram";
import { DailyNotes } from "@/components/home/daily-notes";
import { ActionBar } from "@/components/home/action-bar";
import { FALLBACK_SHOWCASE } from "@/components/home/fallback";
import { getFeaturedThought, getHomeShowcase, getStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HEADLINE = ["Company-wise", "LeetCode", "questions"];

export default async function Home() {
  const [stats, showcase, thought, user] = await Promise.all([
    getStats().catch(() => null),
    getHomeShowcase().catch(() => null),
    getFeaturedThought().catch(() => null),
    getCurrentUser().catch(() => null),
  ]);
  const data = showcase?.hero?.rows.length && showcase.open ? showcase : FALLBACK_SHOWCASE;
  const questions = stats?.questions ? formatNumber(stats.questions) : null;
  const companies = stats?.companies ? formatNumber(stats.companies) : null;
  const pair = data.pair ?? FALLBACK_SHOWCASE.pair!;
  const checklist = (data.hero?.rows ?? []).map((r) => r.title);
  const daily = data.daily ?? FALLBACK_SHOWCASE.daily!;
  const pastDays = data.mostAsked.map((q) => q.title).filter((t) => t !== daily.title).slice(0, 4);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section
        aria-labelledby="hero-h"
        className="relative flex min-h-[calc(100svh-var(--nav))] flex-col pt-10 pb-6 lg:pt-12 lg:pb-16"
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
                  {questions} questions asked by {companies} companies, sorted by how often each one comes up. Free
                  forever.
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

      {/* ---------------------------------------------------------- one search */}
      <section id="questions" aria-labelledby="questions-h" className="pt-24 pb-12 lg:pt-[120px] lg:pb-[72px]">
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="questions-h" className="t-h2 lg:col-span-5">
              One search across every company
            </h2>
            <div className="grid content-start justify-items-start gap-4 lg:col-span-6 lg:col-start-7">
              <p className="t-lead max-w-[60ch]">
                Type a keyword, then filter by difficulty and frequency. Open any question to see which companies ask
                it and save it for revision.
              </p>
              <Link href="/questions" className="link">
                See all questions
                <Arrow />
              </Link>
            </div>
          </div>
          <SearchShowcase data={data} />
        </div>
      </section>

      {/* ---------------------------------------------------------- statement */}
      <section
        id="smarter"
        aria-labelledby="smarter-h"
        className="flex flex-col justify-center pt-24 pb-12 lg:min-h-svh lg:pt-[120px] lg:pb-[72px]"
      >
        <div className="wrap grid gap-8">
          <LiquidType
            id="smarter-h"
            className="max-w-[14ch] text-[clamp(52px,9vw,150px)] leading-none tracking-[-0.035em] max-sm:text-[clamp(44px,14vw,84px)]"
          >
            Practice smarter, not harder
          </LiquidType>
          <p className="t-lead max-w-[62ch]">
            Start with the questions your target company asks most. Then compare it with your second choice and study
            what they share.
          </p>
          {thought && (
            <figure className="grid max-w-[62ch] gap-2">
              <blockquote className="t-h3 text-pretty">&ldquo;{thought.text}&rdquo;</blockquote>
              <figcaption className="text-[14px] text-ink-soft">
                {thought.author}, in today&apos;s Suvichar.{" "}
                <Link href="/suvichar" className="link text-[14px]">
                  See every Suvichar
                  <Arrow />
                </Link>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section id="features" aria-labelledby="features-h" className="pt-24 pb-12 lg:min-h-svh lg:pt-[120px] lg:pb-[72px]">
        <div className="wrap">
          <h2 id="features-h" className="t-h2 mb-8 max-w-[760px] lg:mb-12">
            Track progress and compare companies. <span className="text-muted">Your ticks follow you to every list.</span>
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:gap-6">
            <article className="card overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <h3 className="font-sans text-[18px] leading-snug font-medium tracking-[-0.01em] lg:text-[20px]">
                  Ticks off solved questions
                </h3>
                <p className="mt-2 text-ink-soft lg:min-h-[2lh]">Mark a question solved once and it shows solved on every list.</p>
              </div>
              <ChecklistCard company={data.hero?.company ?? "Amazon"} items={checklist} />
            </article>
            <article className="card overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <h3 className="font-sans text-[18px] leading-snug font-medium tracking-[-0.01em] lg:text-[20px]">
                  Compares two companies
                </h3>
                <p className="mt-2 text-ink-soft lg:min-h-[2lh]">
                  Pick {pair.a} and {pair.b} and see the questions both of them ask.
                </p>
              </div>
              <CompareDiagram a={pair.a} b={pair.b} shared={pair.shared} />
            </article>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- faq */}
      <section id="faq" aria-labelledby="faq-h" className="pt-24 pb-12 lg:min-h-svh lg:pt-[120px] lg:pb-[72px]">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="grid content-start justify-items-start gap-4 lg:col-span-5">
            <h2 id="faq-h" className="t-h2">
              Questions
            </h2>
            <p>About the lists, the account and the daily question.</p>
            <Link href="/about" className="link">
              Read about The Dreamers
              <Arrow />
            </Link>
            <div className="mt-8 hidden w-full sm:block">
              <DailyNotes today={daily} past={pastDays} />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {[
              {
                q: "Is The Dreamers free?",
                a: "Yes, free forever. Every company list, filter and tracker is included.",
              },
              {
                q: "Do I need an account to see the questions?",
                a: "Yes. Sign in with Google, or with an email and a password.",
              },
              {
                q: "Which companies are on it?",
                a: `${companies ?? "Two hundred"}, including Amazon, Google, Microsoft, Apple, Bloomberg, Uber and Goldman Sachs.`,
              },
              {
                q: "Is there a daily question?",
                a: "Yes. A new question is picked every day. Solve at least one question a day and your dashboard keeps your streak.",
              },
            ].map((f, i) => (
              <div key={f.q} className={`grid gap-2 border-b border-line py-6 ${i === 0 ? "pt-0" : ""}`}>
                <h3 className="font-sans text-[18px] leading-[1.4] font-medium tracking-normal lg:text-[20px]">{f.q}</h3>
                <p className="max-w-[64ch] text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- close */}
      <section aria-labelledby="close-h" className="pt-24 pb-24 lg:pt-[120px] lg:pb-[120px]">
        <div className="wrap grid gap-8">
          <div className="grid gap-4">
            <h2 id="close-h" className="t-h2 max-w-[20ch]">
              {user ? "Pick up where you left off" : "Start with your target company"}
            </h2>
            <p className="t-lead text-ink-soft">
              {user
                ? "Your solved questions, revision list and streak are on your dashboard."
                : "Free forever. Sign in with Google or with your email."}
            </p>
          </div>
          <Link href={user ? "/dashboard" : "/companies"} className="btn btn-primary btn-xl w-full">
            {user ? "Open your dashboard" : "Find your company"}
            <Arrow />
          </Link>
        </div>
      </section>

      <ActionBar />
    </>
  );
}
