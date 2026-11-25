"use client";

import { useState } from "react";
import { Building2, ListChecks, Quote, User, Shield, Users } from "lucide-react";
import type { CompanyLite, ThoughtLite, ProfileLite, UserRow } from "@/lib/data";
import { CompaniesPanel } from "./companies-panel";
import { QuestionsPanel } from "./questions-panel";
import { ThoughtsPanel } from "./thoughts-panel";
import { ProfilePanel } from "./profile-panel";
import { UsersPanel } from "./users-panel";

const TABS = [
  { key: "users", label: "Users", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "questions", label: "Questions", icon: ListChecks },
  { key: "suvichar", label: "Suvichar", icon: Quote },
  { key: "profile", label: "About me", icon: User },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminClient({
  initialCompanies,
  initialThoughts,
  initialProfile,
  userStats,
  users = [],
}: {
  initialCompanies: CompanyLite[];
  initialThoughts: ThoughtLite[];
  initialProfile: ProfileLite;
  userStats?: { total: number; verified: number };
  users?: UserRow[];
}) {
  const [tab, setTab] = useState<TabKey>("users");
  const [companies, setCompanies] = useState(initialCompanies);

  return (
    <div className="pb-24">
      <div className="page-in flex items-center gap-4 pt-10 pb-8 lg:pt-14">
        <span className="grid h-12 w-12 place-items-center rounded-[8px] border border-line bg-surface text-ink">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-[clamp(32px,2vw+22px,44px)] leading-[1.05] tracking-[-0.035em]">Admin</h1>
          <p className="text-[15px] text-muted">Manage companies, questions, Suvichar and the About page.</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Users" value={userStats?.total ?? 0} />
        <StatCard label="Verified users" value={userStats?.verified ?? 0} />
        <StatCard label="Companies" value={companies.length} />
        <StatCard label="Thoughts" value={initialThoughts.length} />
      </div>

      <div className="tabs mb-8" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className="tab"
          >
            <t.icon className="h-4 w-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersPanel users={users} />}
      {tab === "companies" && <CompaniesPanel companies={companies} setCompanies={setCompanies} />}
      {tab === "questions" && <QuestionsPanel companies={companies} />}
      {tab === "suvichar" && <ThoughtsPanel initial={initialThoughts} />}
      {tab === "profile" && <ProfilePanel initial={initialProfile} />}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card grid gap-2 p-5">
      <div className="text-[14px] text-muted">{label}</div>
      <div className="text-[30px] leading-none font-medium tracking-[-0.03em]">{value.toLocaleString("en-US")}</div>
    </div>
  );
}
