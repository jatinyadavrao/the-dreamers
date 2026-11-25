import { EmptyState, PageHead } from "@/components/ui/kit";
import { FxGround, SAGE } from "@/components/fx/fx-ground";
import { getThoughts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Suvichar" };

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default async function SuvicharPage() {
  const thoughts = await getThoughts().catch(() => []);
  const featured = thoughts.find((t) => t.isFeatured) ?? thoughts[0] ?? null;
  const rest = thoughts.filter((t) => t.id !== featured?.id);

  return (
    <section className="wrap pb-24">
      <PageHead title="Suvichar" lead="A short thought for the day, posted by The Dreamers. Read it before the first question." />

      {!featured ? (
        <EmptyState title="No thoughts posted yet" body="Check back soon." />
      ) : (
        <>
          <figure className="frame-lit relative grid min-h-[360px] content-end p-6 sm:p-10 lg:min-h-[440px] lg:p-14">
            <FxGround
              effect="painterly-landscape"
              palette={SAGE}
              seed={11}
              params={{ blur: 1, brush: 0.3, slope: 6, hillY: 0.24, horizon: 0.58, calm: 0.9, calmX: 0.3, calmY: 0.7 }}
            />
            <div className="relative z-10 grid max-w-[720px] gap-5">
              <span className="text-[14px] font-medium text-ground-muted">Today&apos;s Suvichar · {featured.category}</span>
              <blockquote className="text-[clamp(28px,2.2vw+18px,48px)] leading-[1.15] tracking-[-0.03em] text-ground-ink">
                &ldquo;{featured.text}&rdquo;
              </blockquote>
              <figcaption className="text-[14px] text-ground-muted">
                {featured.author} · {formatDate(featured.createdAt)}
              </figcaption>
            </div>
          </figure>

          {rest.length > 0 && (
            <>
              <h2 className="t-h3 mt-16 mb-6">Earlier thoughts</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {rest.map((t) => (
                  <li key={t.id} className="card grid content-between gap-6 p-6">
                    <p className="text-[18px] leading-relaxed tracking-[-0.01em]">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center justify-between gap-3 text-[13px] text-muted">
                      <span className="font-mono text-[12px] uppercase tracking-[0.04em]">{t.category}</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
