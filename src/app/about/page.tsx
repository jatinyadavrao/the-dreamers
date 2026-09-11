import { Camera, Play, MessageCircle, Code2, Briefcase, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { getProfile } from "@/lib/data";
import { toDirectImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "About · The Dreamers" };

const SOCIALS: { key: string; label: string; icon: LucideIcon; color: string }[] = [
  { key: "instagram", label: "Instagram", icon: Camera, color: "hover:text-pink-400" },
  { key: "youtube", label: "YouTube", icon: Play, color: "hover:text-red-400" },
  { key: "twitter", label: "Twitter / X", icon: MessageCircle, color: "hover:text-sky-400" },
  { key: "github", label: "GitHub", icon: Code2, color: "hover:text-white" },
  { key: "linkedin", label: "LinkedIn", icon: Briefcase, color: "hover:text-blue-400" },
];

export default async function AboutPage() {
  const profile = await getProfile().catch(() => null);
  const socials = profile?.socials ?? {};
  const active = SOCIALS.filter((s) => socials[s.key]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Reveal className="text-center">
        <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-dream-500 to-nebula-500 p-1">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[var(--background)]">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toDirectImageUrl(profile.avatarUrl)} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-gradient">
                {profile?.name?.[0] ?? "D"}
              </span>
            )}
          </div>
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{profile?.name ?? "The Dreamer"}</h1>
        <p className="mt-2 text-dream-300">{profile?.role}</p>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-[var(--muted)]">{profile?.bio}</p>
      </Reveal>

      {active.length > 0 && (
        <Reveal delay={0.15} className="mt-10 flex flex-wrap justify-center gap-3">
          {active.map((s) => (
            <a
              key={s.key}
              href={socials[s.key]}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass flex items-center gap-2 rounded-full px-5 py-3 font-medium text-[var(--muted)] transition-all hover:-translate-y-1 ${s.color}`}
            >
              <s.icon className="h-5 w-5" />
              {s.label}
            </a>
          ))}
        </Reveal>
      )}
    </section>
  );
}
