"use client";

/** The pause control every self-moving picture carries (WCAG 2.2.2): a 32px disc, 44px hit area. */
export function PauseButton({
  paused,
  onToggle,
  className = "absolute right-3 bottom-3",
}: {
  paused: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? "Play animation" : "Pause animation"}
      className={`${className} z-10 grid h-8 w-8 place-items-center rounded-full border border-[color-mix(in_oklab,var(--ink)_16%,transparent)] bg-bg text-ink opacity-90 shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_12px_-4px_rgb(0_0_0/0.28)] transition-opacity before:absolute before:-inset-1.5 before:rounded-full before:content-[''] hover:opacity-100 motion-reduce:hidden`}
    >
      {paused ? (
        <svg viewBox="0 0 16 16" className="ml-px h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M4 2.5v11l9-5.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <rect x="3.5" y="2.5" width="3" height="11" rx="0.5" />
          <rect x="9.5" y="2.5" width="3" height="11" rx="0.5" />
        </svg>
      )}
    </button>
  );
}
