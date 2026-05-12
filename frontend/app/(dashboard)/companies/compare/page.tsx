"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useStore } from "@/store";
import { apiMatchAll, apiCompareCompanies } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_COS = ["TCS","Infosys","Wipro","Cognizant","HCL","Capgemini","Accenture","Mphasis","Amazon","Microsoft","Google","Flipkart","Swiggy","Zomato"];
const COLORS = ["#7C3AED","#3B82F6","#10B981","#F59E0B","#EF4444"];

export default function ComparePage() {
  const { lastProfile: profile, lastPrediction: pred } = useStore();
  const [selected, setSelected] = useState<string[]>(["Amazon","TCS","Infosys"]);
  const [rec, setRec] = useState(""); const [recLoading, setRecLoading] = useState(false);

  const { data } = useQuery({
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

  const allMatches = data ? [...(data.eligible ?? []), ...(data.stretch ?? []), ...(data.not_eligible ?? [])] : [];
  const selMatches = allMatches.filter(m => selected.includes(m.company_name));

  const radarData = selMatches.length > 0
    ? Object.keys(selMatches[0].fit_breakdown).map(key => ({
        subject: key.replace(/_/g, " "),
        ...Object.fromEntries(selMatches.map(m => [m.company_name, m.fit_breakdown[key]]))
      }))
    : [];

  async function getRecommendation() {
    if (!data) return;
    setRecLoading(true);
    try {
      const text = await apiCompareCompanies(profile!, selected, pred!.placement_probability);
      setRec(text);
    } catch { toast.error("Comparison failed"); }
    finally { setRecLoading(false); }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">⚖️ Company Comparison</h1>

      <div className="glass-card p-5">
        <p className="text-xs text-gray-400 mb-2">Select 2–5 companies</p>
        <div className="flex flex-wrap gap-2">
          {ALL_COS.map(c => (
            <button key={c} onClick={() => setSelected(s =>
              s.includes(c) ? s.filter(x => x !== c) : s.length < 5 ? [...s, c] : s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                selected.includes(c) ? "bg-brand border-brand text-white" : "border-surface-border text-gray-400")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {selMatches.length > 1 && (
        <>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Fit Breakdown Comparison</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A3D" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#161625", border: "1px solid #2A2A3D", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {selMatches.map((m, i) => (
                  <Radar key={m.company_name} name={m.company_name} dataKey={m.company_name}
                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-2 text-gray-400">Company</th>
                  <th className="text-gray-400">Fit</th>
                  <th className="text-gray-400">Est. Prob</th>
                  <th className="text-gray-400">CTC</th>
                  <th className="text-gray-400">Difficulty</th>
                  <th className="text-gray-400">Prep</th>
                </tr>
              </thead>
              <tbody>
                {selMatches.sort((a, b) => b.fit_score - a.fit_score).map(m => (
                  <tr key={m.company_name} className="border-b border-surface-border/50">
                    <td className="py-2 text-white font-medium">{m.company_name}</td>
                    <td className="text-center text-violet-400 font-bold">{m.fit_score}</td>
                    <td className="text-center text-white">{m.calibrated_probability.toFixed(1)}%</td>
                    <td className="text-center text-emerald-400">{m.ctc_range}</td>
                    <td className="text-center capitalize text-gray-300">{m.hiring_difficulty.replace("_", " ")}</td>
                    <td className="text-center text-gray-300">{m.prep_timeline_weeks}w</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={getRecommendation} disabled={recLoading} className="btn-primary w-full">
            {recLoading ? "Analyzing with AI…" : "🤖 Get AI Recommendation"}
          </button>
          {rec && (
            <div className="glass-card p-5 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{rec}</ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
}
