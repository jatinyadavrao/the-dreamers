"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThoughtLite } from "@/lib/data";

const input =
  "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-dream-400";

export function ThoughtsPanel({ initial }: { initial: ThoughtLite[] }) {
  const router = useRouter();
  const [thoughts, setThoughts] = useState(initial);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Motivation");
  const [feature, setFeature] = useState(true);

  async function add() {
    if (!text.trim()) return;
    const res = await fetch("/api/admin/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category, isFeatured: feature }),
    });
    if (res.ok) {
      const doc = await res.json();
      const created: ThoughtLite = {
        id: doc._id,
        text,
        category,
        author: doc.author ?? "The Dreamer",
        isFeatured: feature,
        createdAt: new Date().toISOString(),
      };
      setThoughts((t) => [created, ...(feature ? t.map((x) => ({ ...x, isFeatured: false })) : t)]);
      setText("");
      router.refresh();
    }
  }

  async function feat(id: string) {
    await fetch("/api/admin/thoughts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isFeatured: true }),
    });
    setThoughts((t) => t.map((x) => ({ ...x, isFeatured: x.id === id })));
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/thoughts?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setThoughts((t) => t.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 font-display font-semibold">Post a Suvichar</h3>
        <textarea
          className={`${input} w-full`}
          rows={3}
          placeholder="Write something motivational…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input className={`${input} w-40`} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" checked={feature} onChange={(e) => setFeature(e.target.checked)} />
            Feature as today&apos;s thought
          </label>
          <button onClick={add} className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-dream-500 to-nebula-500 px-5 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Post
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {thoughts.map((t) => (
          <div key={t.id} className={cn("glass rounded-2xl p-4", t.isFeatured && "border-nebula-400/50")}>
            <div className="flex items-start justify-between gap-3">
              <p className="leading-relaxed">“{t.text}”</p>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => feat(t.id)} aria-label="Feature" className={cn("rounded-lg p-2", t.isFeatured ? "text-nebula-400" : "text-[var(--muted)] hover:text-nebula-400")}>
                  <Star className={cn("h-4 w-4", t.isFeatured && "fill-current")} />
                </button>
                <button onClick={() => remove(t.id)} aria-label="Delete" className="rounded-lg p-2 text-[var(--muted)] hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <span className="mt-2 inline-block text-xs text-dream-300">{t.category}</span>
          </div>
        ))}
        {thoughts.length === 0 && <p className="text-center text-sm text-[var(--muted)]">No thoughts yet.</p>}
      </div>
    </div>
  );
}
