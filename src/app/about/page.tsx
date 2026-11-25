import Link from "next/link";
import { SocialIcon } from "@/components/ui/social-icons";
import { Arrow } from "@/components/ui/arrow";
import { getProfile, getStats } from "@/lib/data";
import { formatNumber, initials, toDirectImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "About" };

const SOCIALS: { key: string; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
];

export default async function AboutPage() {
  const [profile, stats] = await Promise.all([getProfile().catch(() => null), getStats().catch(() => null)]);
  const socials = profile?.socials ?? {};
  const active = SOCIALS.filter((s) => socials[s.key]);
  const name = profile?.name || "The Dreamer";

  return (
    <section className="wrap pb-24">
      <div className="page-in grid gap-12 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-16">
        <div className="lg:col-span-4">
          <div className="aspect-square w-40 overflow-hidden rounded-[8px] border border-line bg-surface lg:w-full lg:max-w-[320px]">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toDirectImageUrl(profile.avatarUrl)} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-[64px] tracking-[-0.04em] text-muted">
                {initials(name)}
              </span>
            )}
          </div>
        </div>
        <div className="grid content-start gap-6 lg:col-span-7 lg:col-start-6">
          <div className="grid gap-2">
            <h1 className="text-[clamp(36px,2.6vw+24px,56px)] leading-[1.04] tracking-[-0.04em]">{name}</h1>
            {profile?.role && <p className="t-lead text-muted">{profile.role}</p>}
          </div>
          {profile?.bio && <p className="t-lead max-w-[60ch] text-ink-soft">{profile.bio}</p>}
          {active.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {active.map((s) => (
                <li key={s.key}>
                  <a href={socials[s.key]} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <SocialIcon name={s.key} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 grid gap-4 border-t border-line pt-8">
            <h2 className="t-h3">About The Dreamers</h2>
            <p className="max-w-[62ch] text-ink-soft">
              The Dreamers lists the LeetCode questions each company asks, sorted by how often each one comes up, so you
              can practise the questions your target company actually asks. It is free, and it keeps your solved
              questions, revision list and notes in one place.
            </p>
            {stats && stats.companies > 0 && (
              <dl className="mt-2 grid max-w-md grid-cols-2 gap-6">
                <div>
                  <dt className="text-[14px] text-muted">Companies</dt>
                  <dd className="mt-1 text-[32px] leading-none font-medium tracking-[-0.03em]">{formatNumber(stats.companies)}</dd>
                </div>
                <div>
                  <dt className="text-[14px] text-muted">Questions</dt>
                  <dd className="mt-1 text-[32px] leading-none font-medium tracking-[-0.03em]">{formatNumber(stats.questions)}</dd>
                </div>
              </dl>
            )}
            <div className="mt-2">
              <Link href="/companies" className="link">
                Find your company
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
