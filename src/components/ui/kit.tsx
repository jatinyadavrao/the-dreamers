import Link from "next/link";
import { cn, initials, monogramHue } from "@/lib/utils";

/** A page's head: optional crumbs, the title, a lead line, and actions on the right. */
export function PageHead({
  title,
  lead,
  actions,
  crumbs,
  className,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  crumbs?: { href?: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("page-in grid gap-6 pt-10 pb-8 lg:flex lg:items-end lg:justify-between lg:pt-14 lg:pb-10", className)}>
      <div className="grid min-w-0 gap-3">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
            {crumbs.map((c, i) => (
              <span key={c.label} className="inline-flex items-center gap-2">
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current="page">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <span aria-hidden>/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[clamp(36px,2.6vw+24px,56px)] leading-[1.04] tracking-[-0.04em]">{title}</h1>
        {lead && <p className="t-lead max-w-[62ch] text-ink-soft">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div>}
    </div>
  );
}

/** A company's monogram on a stable quiet tone. */
export function Monogram({
  name,
  slug,
  size = 40,
  className,
}: {
  name: string;
  slug: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("monogram", className)}
      style={{
        ["--h" as string]: monogramHue(slug),
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        borderRadius: size >= 48 ? 8 : 6,
      }}
    >
      {initials(name)}
    </span>
  );
}

/** A thin meter: the filled part in the accent, the track a lighter step. */
export function Meter({
  value,
  max,
  label,
  className,
  tone = "accent",
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
  tone?: "accent" | "ink";
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)]", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]", tone === "accent" ? "bg-accent" : "bg-ink")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card grid justify-items-center gap-3 px-6 py-14 text-center", className)}>
      <p className="text-[17px] font-medium">{title}</p>
      {body && <p className="max-w-[46ch] text-[15px] text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** A stat tile: label, value (proportional figures), an optional line under it. */
export function StatTile({
  label,
  value,
  sub,
  children,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card grid content-start gap-2 p-5", className)}>
      <div className="text-[14px] text-muted">{label}</div>
      <div className="font-sans text-[34px] leading-none font-medium tracking-[-0.03em]">{value}</div>
      {sub && <div className="text-[13px] text-muted">{sub}</div>}
      {children}
    </div>
  );
}
