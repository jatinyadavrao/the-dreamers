"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import type { CompanyLite } from "@/lib/data";
import { slugify } from "@/lib/utils";

const input = "input input-sm";

export function CompaniesPanel({
  companies,
  setCompanies,
}: {
  companies: CompanyLite[];
  setCompanies: (c: CompanyLite[]) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl }),
    });
    setBusy(false);
    if (res.ok) {
      const slug = slugify(name);
      if (!companies.some((c) => c.slug === slug))
        setCompanies([...companies, { name, slug, logoUrl, questionCount: 0 }]);
      setName("");
      setLogoUrl("");
      router.refresh();
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete this company and all its questions? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/companies?slug=${slug}`, { method: "DELETE" });
    if (res.ok) {
      setCompanies(companies.filter((c) => c.slug !== slug));
      router.refresh();
    }
  }

  async function rename(slug: string, newName: string) {
    await fetch("/api/admin/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name: newName }),
    });
    setCompanies(companies.map((c) => (c.slug === slug ? { ...c, name: newName } : c)));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="mb-3 font-sans font-medium tracking-normal">Add company</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className={`${input} flex-1`} placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={`${input} flex-1`} placeholder="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          <button
            onClick={add}
            disabled={busy}
            className="flex items-center justify-center gap-2 btn btn-primary btn-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <div className="card divide-y divide-line">
        {companies.map((c) => (
          <div key={c.slug} className="flex items-center gap-3 p-4">
            <input
              defaultValue={c.name}
              onBlur={(e) => e.target.value !== c.name && rename(c.slug, e.target.value)}
              className={`${input} flex-1`}
            />
            <span className="w-24 text-right text-xs text-muted">{c.questionCount} Qs</span>
            <button onClick={() => remove(c.slug)} className="rounded-[4px] p-2 text-muted hover:text-danger" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {companies.length === 0 && <p className="p-6 text-center text-sm text-muted">No companies yet.</p>}
      </div>
      <p className="flex items-center gap-2 text-xs text-muted">
        <Save className="h-3 w-3" /> Names save automatically when you click away.
      </p>
    </div>
  );
}
