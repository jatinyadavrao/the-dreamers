import Link from "next/link";
import { cn } from "@/lib/utils";

/** The mark: a geometric D cut from a brand-orange tile. Pure SVG so it stays crisp from 16px up. */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("flex-none", className)}
    >
      <rect width="24" height="24" rx="5" fill="var(--brand)" />
      <path
        fillRule="evenodd"
        fill="var(--brand-ink)"
        d="M6 6h6a6 6 0 0 1 0 12H6zM9 9v6h3a3 3 0 0 0 0-6z"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  size = "md",
}: {
  href?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 flex-none items-center gap-2.5 font-medium tracking-[-0.02em] whitespace-nowrap",
        size === "md" ? "text-[20px] lg:text-[21px]" : "text-[17px]",
        className
      )}
      aria-label="The Dreamers, home"
    >
      <LogoMark size={size === "md" ? 22 : 20} />
      <span>The Dreamers</span>
    </Link>
  );
}
