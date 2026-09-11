"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Sparkles, Shield } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/companies", label: "Companies" },
  { href: "/questions", label: "Explore" },
  { href: "/compare", label: "Compare" },
  { href: "/suvichar", label: "Suvichar" },
  { href: "/about", label: "About" },
];

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-dream-400 transition-transform group-hover:rotate-12" />
          <span className="font-display text-lg font-bold tracking-tight text-gradient">
            The Dreamers
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:text-dream-300",
                pathname === l.href ? "text-dream-300" : "text-[var(--muted)]"
              )}
            >
              {l.label}
              {pathname === l.href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-dream-400 to-nebula-400"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:text-dream-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-dream-300 sm:block"
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-nebula-400 hover:text-nebula-500 sm:flex"
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-lg bg-gradient-to-r from-dream-500 to-nebula-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105">
                Sign in
              </button>
            </SignInButton>
          </Show>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="rounded-lg p-2 text-[var(--muted)] md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden"
          >
            {[...LINKS, { href: "/dashboard", label: "Dashboard" }, ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])].map(
              (l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-dream-500/10 hover:text-dream-300"
                >
                  {l.label}
                </Link>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
