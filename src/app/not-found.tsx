import Link from "next/link";
import { Arrow } from "@/components/ui/arrow";

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[70svh] content-center gap-6 py-24">
      <p className="font-mono text-[13px] text-muted">404</p>
      <h1 className="t-h1 max-w-[16ch]">This page is not on the list</h1>
      <p className="t-lead max-w-[52ch] text-ink-soft">
        The link may be old, or the company may have been renamed. Start again from the company lists.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/companies" className="btn btn-primary">
          Find your company
          <Arrow />
        </Link>
        <Link href="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </section>
  );
}
