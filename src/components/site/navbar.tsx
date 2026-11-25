"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Search, Shield } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/components/auth-provider";
import { ThemeSwitch } from "@/components/site/theme-switch";
import { openPalette } from "@/components/site/command-palette";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/companies", label: "Companies" },
  { href: "/questions", label: "Questions" },
  { href: "/compare", label: "Compare" },
  { href: "/suvichar", label: "Suvichar" },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { user, isSignedIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close both panels on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(false);
  }

  // lock the page behind the phone menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!menu && !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setOpen(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (menu && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu, open]);

  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--nav)] border-b border-line bg-bg">
      <a href="#main" className="sr-only-focusable btn btn-secondary btn-sm absolute top-3 left-3 z-10">
        Skip to content
      </a>
      <div className="wrap flex h-full items-center gap-6 xl:gap-16">
        <Logo />

        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-3">
          {isSignedIn ? (
            <>
              <button
                type="button"
                onClick={openPalette}
                className="hidden h-9 w-56 items-center gap-2 rounded-[4px] border border-line-strong px-3 text-left text-[14px] text-muted transition-colors hover:border-[color-mix(in_oklab,var(--ink)_32%,transparent)] hover:text-ink lg:flex"
              >
                <Search className="h-4 w-4" aria-hidden />
                <span className="flex-1">Search</span>
                <span className="kbd">⌘K</span>
              </button>
              <button
                type="button"
                onClick={openPalette}
                aria-label="Search"
                className="btn btn-secondary btn-icon h-11 w-11 lg:hidden"
              >
                <Search className="h-4 w-4" aria-hidden />
              </button>

              <div className="relative hidden lg:block" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  aria-expanded={menu}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-[14px] font-medium text-ink ring-1 ring-line transition-shadow hover:ring-line-strong"
                >
                  {initial}
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                      className="card absolute right-0 mt-2 w-64 p-1.5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]"
                    >
                      <div className="px-3 pt-2 pb-2.5">
                        {user?.name && <div className="truncate text-[14px] font-medium">{user.name}</div>}
                        <div className="truncate text-[13px] text-muted">{user?.email}</div>
                      </div>
                      <div className="my-1 h-px bg-line" />
                      <MenuLink href="/dashboard" icon={LayoutDashboard}>
                        Dashboard
                      </MenuLink>
                      {isAdmin && (
                        <MenuLink href="/admin" icon={Shield}>
                          Admin
                        </MenuLink>
                      )}
                      <div className="px-3 py-1">
                        <ThemeSwitch className="h-9 w-full justify-start text-[14px] text-muted hover:text-ink" />
                      </div>
                      <div className="my-1 h-px bg-line" />
                      <button
                        role="menuitem"
                        type="button"
                        onClick={signOut}
                        className="flex h-9 w-full items-center gap-2.5 rounded-[4px] px-3 text-left text-[14px] text-ink hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)]"
                      >
                        <LogOut className="h-4 w-4 text-muted" aria-hidden /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="nav-link hidden px-2 lg:inline-flex" aria-current={pathname === "/sign-in" ? "page" : undefined}>
                Sign in
              </Link>
              <Link href="/companies" className="btn btn-primary hidden sm:inline-flex">
                Find your company
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="phone-menu"
            aria-label={open ? "Close menu" : "Menu"}
            className="btn btn-secondary btn-icon h-11 w-11 lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="phone-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            className="fixed inset-x-0 top-[var(--nav)] bottom-0 overflow-y-auto border-t border-line bg-bg lg:hidden"
          >
            <nav aria-label="Main" className="wrap flex flex-col pt-2">
              {[
                ...LINKS,
                { href: "/about", label: "About" },
                ...(isSignedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
                ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
                  className={cn(
                    "flex h-14 items-center border-b border-line text-[20px] tracking-[-0.01em]",
                    isCurrent(pathname, l.href) ? "text-ink" : "text-ink-soft"
                  )}
                >
                  {l.label}
                  {isCurrent(pathname, l.href) && <span className="ml-3 h-0.5 w-6 rounded bg-current" aria-hidden />}
                </Link>
              ))}
              <div className="flex flex-col gap-3 py-6">
                {isSignedIn ? (
                  <button type="button" onClick={signOut} className="btn btn-secondary h-12 w-full">
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link href="/companies" className="btn btn-primary h-12 w-full">
                      Find your company
                    </Link>
                    <Link href="/sign-in" className="btn btn-ghost h-11 w-full">
                      Sign in
                    </Link>
                  </>
                )}
                <ThemeSwitch className="mx-auto h-11 text-[15px] text-muted" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      className="flex h-9 items-center gap-2.5 rounded-[4px] px-3 text-[14px] hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)]"
    >
      <Icon className="h-4 w-4 text-muted" aria-hidden />
      {children}
    </Link>
  );
}
