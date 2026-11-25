import { cn } from "@/lib/utils";

/** A question's level: the coloured dot carries identity, the word stays in text ink. */
export function DifficultyBadge({ difficulty, className }: { difficulty: string; className?: string }) {
  const d = (difficulty || "Medium").toLowerCase();
  return <span className={cn("diff", `diff-${d}`, className)}>{difficulty}</span>;
}
