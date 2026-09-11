"use client";

import { useState } from "react";
import { Building2, ListChecks, Sparkles, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyLite, ThoughtLite, ProfileLite } from "@/lib/data";
import { CompaniesPanel } from "./companies-panel";
import { QuestionsPanel } from "./questions-panel";
import { ThoughtsPanel } from "./thoughts-panel";
import { ProfilePanel } from "./profile-panel";

const TABS = [
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "questions", label: "Questions", icon: ListChecks },
  { key: "suvichar", label: "Suvichar", icon: Sparkles },
  { key: "profile", label: "About Me", icon: User },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminClient({
  initialCompanies,
  initialThoughts,
  initialProfile,
}: {
  initialCompanies: CompanyLite[];
  initialThoughts: ThoughtLite[];
  initialProfile: ProfileLite;
}) {
  const [tab, setTab] = useState<TabKey>("companies");
  const [companies, setCompanies] = useState(initialCompanies);

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-nebula-500/20 to-dream-500/20 p-3 text-nebula-400">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin</h1>
          <p className="text-sm text-[var(--muted)]">Manage everything on The Dreamers.</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-dream-400 bg-dream-500/15 text-dream-300"
                : "border-[var(--border)] text-[var(--muted)] hover:border-dream-400/50"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "companies" && (
        <CompaniesPanel companies={companies} setCompanies={setCompanies} />
      )}
      {tab === "questions" && <QuestionsPanel companies={companies} />}
      {tab === "suvichar" && <ThoughtsPanel initial={initialThoughts} />}
      {tab === "profile" && <ProfilePanel initial={initialProfile} />}
    </div>
  );
}
