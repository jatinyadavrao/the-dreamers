import type { Difficulty } from "@/lib/utils";

const TONE: Record<Difficulty, string> = { Easy: "3", Medium: "1", Hard: "5" };

/** E / M / H on a quiet tone, as the product windows show a question's level. */
export function DifficultyAvatar({ d, className }: { d: Difficulty; className?: string }) {
  return (
    <span className={`ui-avatar ${className ?? ""}`} data-tone={TONE[d] ?? "1"}>
      {d?.[0] ?? "M"}
    </span>
  );
}
