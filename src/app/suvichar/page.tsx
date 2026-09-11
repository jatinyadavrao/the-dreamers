import { Quote, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { getThoughts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Daily Suvichar · The Dreamers" };

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function SuvicharPage() {
  const thoughts = await getThoughts().catch(() => []);
  const featured = thoughts.find((t) => t.isFeatured) ?? thoughts[0] ?? null;
  const rest = thoughts.filter((t) => t.id !== featured?.id);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-nebula-400">
          <Sparkles className="h-4 w-4" /> Daily Suvichar
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          A little <span className="text-gradient">motivation</span> every day
        </h1>
      </Reveal>

      {!featured ? (
        <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">
          No thoughts posted yet. Check back soon. ✨
        </div>
      ) : (
        <>
          <Reveal>
            <div className="glow glass relative overflow-hidden rounded-3xl bg-gradient-to-br from-dream-500/10 to-nebula-500/10 p-8 text-center sm:p-14">
              <Quote className="mx-auto mb-5 h-10 w-10 text-nebula-400" />
              <p className="font-display text-2xl font-medium leading-relaxed sm:text-3xl">
                “{featured.text}”
              </p>
              <p className="mt-6 text-sm text-[var(--muted)]">
                — {featured.author} · {formatDate(featured.createdAt)}
              </p>
            </div>
          </Reveal>

          {rest.length > 0 && (
            <>
              <h2 className="mb-4 mt-14 font-display text-xl font-semibold text-[var(--muted)]">
                Past thoughts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {rest.map((t, i) => (
                  <Reveal key={t.id} delay={(i % 2) * 0.08}>
                    <div className="glass h-full rounded-2xl p-6">
                      <span className="text-xs font-semibold uppercase tracking-wide text-dream-300">
                        {t.category}
                      </span>
                      <p className="mt-2 leading-relaxed">“{t.text}”</p>
                      <p className="mt-3 text-xs text-[var(--muted)]">{formatDate(t.createdAt)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
