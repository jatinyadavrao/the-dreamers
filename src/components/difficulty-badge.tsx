import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Easy: "bg-green-500/15 text-green-400 border-green-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[difficulty] ?? styles.Medium
      )}
    >
      {difficulty}
    </span>
  );
}
