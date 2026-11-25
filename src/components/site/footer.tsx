"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/auth-provider";
import { ThemeSwitch } from "@/components/site/theme-switch";

export function Footer() {
  const { isSignedIn, signOut } = useAuth();
  const year = new Date().getFullYear();

  const cols: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Practice",
      links: [
        { href: "/companies", label: "Companies" },
        { href: "/questions", label: "Questions" },
        { href: "/compare", label: "Compare" },
      ],
    },
    {
      title: "Daily",
      links: [
        { href: "/questions#daily", label: "Today's question" },
        { href: "/suvichar", label: "Suvichar" },
      ],
    },
    {
      title: "Account",
      links: isSignedIn
        ? [{ href: "/dashboard", label: "Dashboard" }]
        : [
            { href: "/sign-in", label: "Sign in" },
            { href: "/sign-up", label: "Create an account" },
          ],
    },
    {
      title: "Help",
      links: [
        { href: "/#faq", label: "Common questions" },
        { href: "/about", label: "About" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 grid content-start gap-4 md:col-span-4 lg:col-span-4">
            <Logo />
            <p className="max-w-[30ch] font-display text-[18px] leading-snug tracking-[-0.02em] text-ink-soft">
              LeetCode questions, sorted by company.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h3 className="mb-4 font-sans text-[14px] font-medium tracking-normal text-muted">{c.title}</h3>
              <ul className="grid gap-1 text-[14px] sm:gap-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center transition-colors hover:text-accent-text sm:min-h-0"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {c.title === "Account" && isSignedIn && (
                  <li>
                    <button
                      type="button"
                      onClick={signOut}
                      className="inline-flex min-h-11 items-center transition-colors hover:text-accent-text sm:min-h-0"
                    >
                      Sign out
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-[13px] text-muted">
          <div className="flex flex-wrap items-center gap-x-5">
            <span>&copy; {year} The Dreamers</span>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-ink">
              Terms
            </Link>
          </div>
          <ThemeSwitch className="hover:text-ink" />
        </div>
      </div>
    </footer>
  );
}
