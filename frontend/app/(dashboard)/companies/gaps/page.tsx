"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStore } from "@/store";
import { apiMatchAll } from "@/lib/api";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GapsPage() {
  const { lastProfile: profile, lastPrediction: pred } = useStore();
  const { data, isLoading } = useQuery({
    queryKey: ["companies", profile?.cgpa, profile?.dsa_score],
    queryFn: () => apiMatchAll(profile!, pred!.placement_probability),
    enabled: !!profile && !!pred,
  });

  if (!profile || !pred) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <AlertCircle size={48} className="text-amber-400" />
      <Link href="/assessment" className="btn-primary">Go to Assessment</Link>
    </div>
  );

  const allMatches = data ? [...(data.eligible ?? []), ...(data.stretch ?? [])] : [];
  const gapMap: Record<string, { count: number; score: number; companies: string[] }> = {};
  for (const m of allMatches) {
    for (const g of m.skill_gaps) {
      if (!gapMap[g.skill]) gapMap[g.skill] = { count: 0, score: 0, companies: [] };
      gapMap[g.skill].count++;
      gapMap[g.skill].score += { critical: 3, important: 2, "nice-to-have": 1 }[g.importance] ?? 1;
      gapMap[g.skill].companies.push(m.company_name);
    }
  }

  const chartData = Object.entries(gapMap)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([skill, d]) => ({ name: skill, companies: d.count, score: d.score, list: d.companies.join(", ") }));

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">🎯 Skill Gap Central</h1>
      <p className="text-gray-400 text-sm">Aggregated gaps across your eligible + stretch companies.</p>

      {isLoading && <div className="glass-card h-64 animate-pulse" />}

      {chartData.length === 0 && !isLoading && (
        <div className="glass-card p-10 text-center">
          <p className="text-emerald-400 text-xl">🎉 No critical gaps!</p>
          <p className="text-gray-400 text-sm mt-2">Your profile meets requirements for your eligible companies.</p>
        </div>
      )}

      {chartData.length > 0 && (
        <>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Gaps by Companies Affected</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: "#161625", border: "1px solid #2A2A3D", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number, _: string, p: any) => [
                    `${v} companies — ${p.payload.list.split(",").slice(0,3).join(", ")}`, "Affected"
                  ]} />
                <Bar dataKey="companies" radius={[0, 4, 4, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.score >= 6 ? "#EF4444" : d.score >= 3 ? "#F59E0B" : "#7C3AED"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {chartData.map((d, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{d.name}</span>
                  <span className="text-xs text-gray-400">{d.companies} companies affected</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{d.list}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
