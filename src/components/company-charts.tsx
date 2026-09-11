"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { DIFFICULTY_COLORS } from "@/lib/utils";
import type { QuestionLite } from "@/lib/data";

export function CompanyCharts({ questions }: { questions: QuestionLite[] }) {
  const byDiff = ["Easy", "Medium", "Hard"].map((d) => ({
    name: d,
    value: questions.filter((q) => q.difficulty === d).length,
  }));

  const topFreq = [...questions]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8)
    .map((q) => ({
      name: q.title.length > 22 ? q.title.slice(0, 22) + "…" : q.title,
      freq: Number(q.frequency.toFixed(1)),
    }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 font-display font-semibold">Difficulty split</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byDiff} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {byDiff.map((d) => (
                  <Cell key={d.name} fill={DIFFICULTY_COLORS[d.name as keyof typeof DIFFICULTY_COLORS]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          {byDiff.map((d) => (
            <span key={d.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: DIFFICULTY_COLORS[d.name as keyof typeof DIFFICULTY_COLORS] }}
              />
              {d.name} ({d.value})
            </span>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 font-display font-semibold">Most frequent problems</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topFreq} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(129,140,248,0.08)" }} />
              <Bar dataKey="freq" fill="#818cf8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "#0b1020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e7ecff",
};
