import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-dream-400" />
          <span className="font-display font-semibold text-gradient">The Dreamers</span>
        </Link>
        <p className="text-center text-sm text-[var(--muted)]">
          Chase your dream company. Built with ♥ for aspiring engineers.
        </p>
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} The Dreamers
        </p>
      </div>
    </footer>
  );
}
