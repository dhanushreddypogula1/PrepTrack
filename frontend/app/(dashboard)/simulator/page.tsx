"use client";

import { useState } from "react";

import Link from "next/link";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

import { toast } from "sonner";

import {
  Sparkles,
  Brain,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react";

import { useStore } from "@/store";

import { apiScenarios } from "@/lib/api";

import { cn } from "@/lib/utils";

const SCENARIOS = [
  {
    label: "DSA +20",
    changes: {
      dsa_score: 20,
    },
  },

  {
    label: "Internship +1",
    changes: {
      internships: 1,
    },
  },

  {
    label: "Projects +2",
    changes: {
      projects: 2,
    },
  },

  {
    label: "Certifications +2",
    changes: {
      certifications: 2,
    },
  },

  {
    label: "Clear Backlog",
    changes: {
      backlogs: -1,
    },
  },

  {
    label: "Communication +15",
    changes: {
      communication_score: 15,
    },
  },

  {
    label: "Aptitude +15",
    changes: {
      aptitude_score: 15,
    },
  },

  {
    label: "Resume +15",
    changes: {
      resume_score: 15,
    },
  },
];

export default function SimulatorPage() {
  const {
    lastProfile: profile,
    lastPrediction: pred,
  } = useStore();

  const [results, setResults] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  if (!profile || !pred) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center rounded-[36px] border border-slate-800 bg-slate-900/50 p-10 text-center backdrop-blur-xl">
        <div className="mb-6 flex size-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <AlertCircle
            size={46}
            className="text-amber-400"
          />
        </div>

        <h2 className="text-4xl font-black text-white">
          No Assessment Yet
        </h2>

        <p className="mt-4 max-w-lg text-lg leading-8 text-slate-400">
          Complete your placement
          assessment to unlock AI
          simulation and scenario
          analysis.
        </p>

        <Link
          href="/assessment"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90"
        >
          Start Assessment
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  async function run() {
    if (!profile) {
      toast.error(
        "Profile unavailable. Please complete assessment again."
      );
      return;
    }

    setLoading(true);

    try {
      const scenariosToSend =
        SCENARIOS.map((s) => {
          const changes: Record<
            string,
            number
          > = {};

          for (const [
            k,
            v,
          ] of Object.entries(
            s.changes
          )) {
            changes[k] =
              Math.min(
                Math.max(
                  (profile as any)[
                    k
                  ] +
                    (v as number),
                  0
                ),
                k === "cgpa"
                  ? 10
                  : k.endsWith(
                      "_score"
                    )
                  ? 100
                  : 15
              );
          }

          return {
            label: s.label,
            changes,
          };
        });

      const data =
        await apiScenarios(
          profile,
          scenariosToSend
        );

      setResults(data);

      toast.success(
        "Simulation complete!"
      );
    } catch {
      toast.error(
        "Scenario run failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const chartData =
    results.map((r) => ({
      name: r.label,
      gain: parseFloat(
        r.gain.toFixed(1)
      ),
    }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 lg:p-10">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            AI What-If Analysis
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            Scenario Simulator
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Simulate profile
            improvements and discover
            which actions will most
            improve your placement
            probability.
          </p>
        </div>
      </div>

      {/* Base KPI */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            label:
              "Current Probability",
            value: `${pred.placement_probability.toFixed(
              1
            )}%`,
            icon: TrendingUp,
            color:
              "from-purple-500/20 to-purple-500/5",
            text: "text-purple-400",
          },

          {
            label:
              "Expected CTC",
            value: `₹${pred.predicted_ctc.toFixed(
              1
            )} LPA`,
            icon: Target,
            color:
              "from-emerald-500/20 to-emerald-500/5",
            text: "text-emerald-400",
          },

          {
            label:
              "Scenarios Available",
            value:
              SCENARIOS.length,
            icon: Brain,
            color:
              "from-blue-500/20 to-blue-500/5",
            text: "text-blue-400",
          },
        ].map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.label}
              className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
            >
              <div
                className={`mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color}`}
              >
                <Icon
                  className={
                    s.text
                  }
                  size={28}
                />
              </div>

              <p className="text-sm uppercase tracking-wider text-slate-400">
                {s.label}
              </p>

              <h2 className="mt-3 text-4xl font-black text-white">
                {s.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Run */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Zap className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              AI Simulation Engine
            </h2>

            <p className="mt-1 text-slate-400">
              Run predictive simulations
              across multiple profile
              improvement scenarios.
            </p>
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            "Running Simulations..."
          ) : (
            <>
              Run All Scenarios
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-8">
          {/* Chart */}
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-cyan-500/10">
                <Brain className="text-cyan-400" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Probability Gain
                  Analysis
                </h2>

                <p className="mt-1 text-slate-400">
                  Compare impact of each
                  improvement action.
                </p>
              </div>
            </div>

            <ResponsiveContainer
              width="100%"
              height={360}
            >
              <BarChart
                data={chartData}
                margin={{
                  bottom: 30,
                }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fill:
                      "#94A3B8",
                    fontSize: 11,
                  }}
                  angle={-15}
                  textAnchor="end"
                />

                <YAxis
                  tick={{
                    fill:
                      "#94A3B8",
                    fontSize: 11,
                  }}
                  unit="%"
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#0F172A",
                    border:
                      "1px solid #334155",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                  formatter={(
                    v: number
                  ) => [
                    `${
                      v > 0
                        ? "+"
                        : ""
                    }${v}%`,
                    "Gain",
                  ]}
                />

                <ReferenceLine
                  y={0}
                  stroke="#334155"
                />

                <Bar
                  dataKey="gain"
                  radius={[
                    8, 8, 0, 0,
                  ]}
                >
                  {chartData.map(
                    (
                      d,
                      i
                    ) => (
                      <Cell
                        key={i}
                        fill={
                          d.gain >=
                          5
                            ? "#10B981"
                            : d.gain >=
                              2
                            ? "#F59E0B"
                            : "#8B5CF6"
                        }
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards */}
          <div className="grid gap-5 lg:grid-cols-2">
            {results
              .sort(
                (
                  a,
                  b
                ) =>
                  b.gain -
                  a.gain
              )
              .map((r, i) => (
                <div
                  key={i}
                  className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-black text-white">
                        {r.label}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        New placement
                        probability
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-200">
                        →
                        {" "}
                        {r.placement_probability.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-2xl font-black",
                        r.gain >=
                          0
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                      )}
                    >
                      {r.gain >=
                      0
                        ? "+"
                        : ""}
                      {r.gain.toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}