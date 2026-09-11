export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute -left-1/4 top-[-10%] h-[60vh] w-[60vh] rounded-full bg-dream-600/25 blur-[120px] animate-aurora" />
      <div
        className="absolute right-[-10%] top-1/4 h-[55vh] w-[55vh] rounded-full bg-nebula-500/20 blur-[120px] animate-aurora"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-10%] left-1/3 h-[50vh] w-[50vh] rounded-full bg-aurora-500/20 blur-[120px] animate-aurora"
        style={{ animationDelay: "-12s" }}
      />
      {/* subtle star grid */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.6) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
