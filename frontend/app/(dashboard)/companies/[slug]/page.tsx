"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useStore } from "@/store";
import { apiMatchOne, apiCompanyRoadmap } from "@/lib/api";
import {
  cn,
  TIER_COLORS,
  ELIGIBILITY_COLORS,
  fmtPct,
  DIFFICULTY_LABELS,
} from "@/lib/utils";
import { RadarChart } from "@/components/RadarChart";
import { toast } from "sonner";

const TABS = [
  "Fit Analysis",
  "Hiring Process",
  "Skill Gaps",
  "AI Roadmap",
  "Tips",
];

type SkillGap = {
  skill: string;
  importance: string;
  fix_effort_weeks: number;
  description: string;
};

export default function CompanyDeepDivePage() {
  const { slug } = useParams<{ slug: string }>();

  const companyName = slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

  const { lastProfile: profile, lastPrediction: pred } = useStore();

  const [tab, setTab] = useState(0);
  const [roadmap, setRoadmap] = useState("");
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const { data: match, isLoading } = useQuery({
    queryKey: ["company-match", companyName],
    queryFn: () =>
      apiMatchOne(companyName, profile!, pred!.placement_probability),
    enabled: !!profile && !!pred,
  });

  async function loadRoadmap() {
    if (roadmap || !profile || !pred) return;

    setRoadmapLoading(true);

    try {
      const text = await apiCompanyRoadmap(
        companyName,
        profile,
        pred.placement_probability
      );

      setRoadmap(text);
    } catch {
      toast.error("Failed to generate roadmap");
    } finally {
      setRoadmapLoading(false);
    }
  }

  if (!profile || !pred) {
    return (
      <p className="text-gray-400">
        Complete an assessment first.
      </p>
    );
  }

  if (isLoading) {
    return <div className="glass-card h-64 animate-pulse" />;
  }

  if (!match) {
    return (
      <p className="text-rose-400">
        Company not found: {companyName}
      </p>
    );
  }

  const radarData = Object.entries(match.fit_breakdown).map(([k, v]) => ({
    subject: k.replace(/_/g, " "),
    value: v as number,
  }));

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-white">
                {match.company_name}
              </h1>

              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  TIER_COLORS[match.tier]
                )}
              >
                {match.tier_label}
              </span>

              <span
                className={cn(
                  "text-sm font-semibold",
                  ELIGIBILITY_COLORS[match.eligibility]
                )}
              >
                ● {match.eligibility.replace("_", " ")}
              </span>
            </div>

            <p className="text-gray-400 text-sm">
              {match.domain} · {match.ctc_range} ·{" "}
              {DIFFICULTY_LABELS[match.hiring_difficulty]}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-white">
              {match.fit_score}
              <span className="text-lg text-gray-400">/100</span>
            </p>

            <p className="text-sm text-gray-400">
              Fit Score
            </p>

            <p className="text-sm text-violet-400 font-semibold">
              {fmtPct(match.calibrated_probability)} selection est.
            </p>
          </div>
        </div>

        <p className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mt-3">
          💡 {match.confidence_note}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1 flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => {
              setTab(i);

              if (i === 3) {
                loadRoadmap();
              }
            }}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              tab === i
                ? "bg-brand text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        {/* Fit Analysis */}
        {tab === 0 && (
          <div className="space-y-4">
            <RadarChart data={radarData} />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                  ✅ Matched
                </p>

                {match.matched_factors.map(
                  (f: string, i: number) => (
                    <p
                      key={i}
                      className="text-xs text-emerald-400 py-0.5"
                    >
                      {f}
                    </p>
                  )
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                  ❌ Missing
                </p>

                {match.missing_factors.length ? (
                  match.missing_factors.map(
                    (f: string, i: number) => (
                      <p
                        key={i}
                        className="text-xs text-rose-400 py-0.5"
                      >
                        {f}
                      </p>
                    )
                  )
                ) : (
                  <p className="text-xs text-emerald-400">
                    Nothing critical!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hiring Process */}
        {tab === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-300 font-mono bg-surface rounded-lg p-3 text-xs leading-relaxed">
              {match.hiring_format_summary}
            </p>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Prep Timeline
              </p>

              <p className="text-white font-semibold">
                {match.prep_timeline_weeks} weeks recommended
              </p>
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {tab === 2 && (
          <div className="space-y-3">
            {match.skill_gaps.length === 0 ? (
              <p className="text-emerald-400 text-sm">
                🎉 No critical skill gaps for{" "}
                {match.company_name}!
              </p>
            ) : (
              match.skill_gaps.map(
                (g: SkillGap, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl p-4 border",
                      g.importance === "critical"
                        ? "bg-rose-400/10 border-rose-400/20"
                        : "bg-amber-400/10 border-amber-400/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">
                        {g.skill}
                      </span>

                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium capitalize",
                          g.importance === "critical"
                            ? "bg-rose-400/20 text-rose-300"
                            : "bg-amber-400/20 text-amber-300"
                        )}
                      >
                        {g.importance}
                      </span>

                      <span className="text-xs text-gray-500 ml-auto">
                        ~{g.fix_effort_weeks}w to fix
                      </span>
                    </div>

                    <p className="text-xs text-gray-300">
                      {g.description}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        )}

        {/* AI Roadmap */}
        {tab === 3 && (
          <div>
            {roadmapLoading && (
              <div className="space-y-2">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-3 bg-surface rounded animate-pulse"
                      style={{
                        width: `${60 + Math.random() * 40}%`,
                      }}
                    />
                  ))}
              </div>
            )}

            {roadmap ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {roadmap}
                </ReactMarkdown>
              </div>
            ) : (
              !roadmapLoading && (
                <p className="text-gray-400 text-sm">
                  Click the &quot;AI Roadmap&quot; tab
                  to generate your personalized roadmap.
                </p>
              )
            )}
          </div>
        )}

        {/* Tips */}
        {tab === 4 && (
          <div className="space-y-3">
            {match.top_tips.map(
              (tip: string, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 text-sm"
                >
                  <span className="text-violet-400 font-bold">
                    {i + 1}.
                  </span>

                  <p className="text-gray-300">
                    {tip}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}