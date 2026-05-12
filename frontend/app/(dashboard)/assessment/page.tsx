"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { toast } from "sonner";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  ArrowRight,
  BarChart3,
} from "lucide-react";

import { useStore } from "@/store";

import { apiPredict } from "@/lib/api";

import {
  fmtPct,
  fmtCTC,
  BRANCHES,
  cn,
} from "@/lib/utils";

import type { Profile } from "@/types";

const DEFAULT: Profile = {
  branch: "CSE",
  cgpa: 7.5,
  dsa_score: 50,
  projects: 2,
  internships: 0,
  certifications: 1,
  hackathons: 0,
  backlogs: 0,
  aptitude_score: 60,
  communication_score: 60,
  resume_score: 60,
};

function Slider({
  label,
  name,
  min,
  max,
  step = 1,
  value,
  onChange,
}: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
          {value}
          {max === 10
            ? ""
            : max === 100
            ? "/100"
            : ""}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(
            name,
            parseFloat(e.target.value)
          )
        }
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-purple-500"
      />
    </div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();

  const { setAssessment } =
    useStore();

  const [profile, setProfile] =
    useState<Profile>(DEFAULT);

  const [pred, setPred] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const set = (k: string, v: any) =>
    setProfile((p) => ({
      ...p,
      [k]: v,
    }));

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const result =
        await apiPredict(profile);

      setPred(result);

      setAssessment(profile, result);

      toast.success(
        "Prediction complete!"
      );
    } catch {
      toast.error(
        "Prediction failed — backend may not be running."
      );
    } finally {
      setLoading(false);
    }
  }

  const fiData =
    pred?.feature_importances?.map(
      ([f, v]: [string, number]) => ({
        name: f.replace(/_/g, " "),
        value: parseFloat(
          (v * 100).toFixed(1)
        ),
      })
    ) ?? [];

  const probColor = pred
    ? pred.placement_probability >= 70
      ? "#10B981"
      : pred.placement_probability >=
        45
      ? "#F59E0B"
      : "#EF4444"
    : "#8B5CF6";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            AI Placement Prediction
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            Placement Assessment
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Analyze your profile with
            machine learning models and
            receive AI-powered placement
            readiness insights.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl"
      >
        {/* Branch */}
        <div className="mb-8">
          <label className="mb-4 block text-sm font-semibold text-slate-300">
            Select Your Branch
          </label>

          <div className="flex flex-wrap gap-3">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() =>
                  set("branch", b)
                }
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                  profile.branch === b
                    ? "border-purple-500 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "border-slate-700 bg-slate-900 text-slate-400 hover:border-purple-500/40 hover:text-white"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Target className="text-purple-400" />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Core Scores
                  </h3>

                  <p className="text-sm text-slate-400">
                    Academic and
                    placement metrics
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <Slider
                  label="CGPA"
                  name="cgpa"
                  min={5}
                  max={10}
                  step={0.1}
                  value={profile.cgpa}
                  onChange={set}
                />

                <Slider
                  label="DSA Score"
                  name="dsa_score"
                  min={0}
                  max={100}
                  value={
                    profile.dsa_score
                  }
                  onChange={set}
                />

                <Slider
                  label="Aptitude Score"
                  name="aptitude_score"
                  min={0}
                  max={100}
                  value={
                    profile.aptitude_score
                  }
                  onChange={set}
                />

                <Slider
                  label="Communication Score"
                  name="communication_score"
                  min={0}
                  max={100}
                  value={
                    profile.communication_score
                  }
                  onChange={set}
                />

                <Slider
                  label="Resume Score"
                  name="resume_score"
                  min={0}
                  max={100}
                  value={
                    profile.resume_score
                  }
                  onChange={set}
                />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Brain className="text-blue-400" />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Experience Metrics
                  </h3>

                  <p className="text-sm text-slate-400">
                    Projects, internships,
                    and achievements
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    label: "Projects",
                    name: "projects",
                    max: 15,
                  },
                  {
                    label:
                      "Internships",
                    name:
                      "internships",
                    max: 5,
                  },
                  {
                    label:
                      "Certifications",
                    name:
                      "certifications",
                    max: 10,
                  },
                  {
                    label:
                      "Hackathons",
                    name:
                      "hackathons",
                    max: 10,
                  },
                  {
                    label:
                      "Active Backlogs",
                    name:
                      "backlogs",
                    max: 10,
                  },
                ].map((f) => (
                  <Slider
                    key={f.name}
                    label={f.label}
                    name={f.name}
                    min={0}
                    max={f.max}
                    value={
                      (profile as any)[
                        f.name
                      ]
                    }
                    onChange={set}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Brain
                className="animate-pulse"
                size={20}
              />
              Running ML Models...
            </>
          ) : (
            <>
              Predict Placement
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {pred && (
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="space-y-8"
        >
          {/* KPI */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Probability */}
            <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-purple-500/10">
                <TrendingUp
                  size={30}
                  className="text-purple-400"
                />
              </div>

              <p className="text-sm uppercase tracking-wider text-slate-400">
                Placement Probability
              </p>

              <p
                className="mt-4 text-6xl font-black"
                style={{
                  color: probColor,
                }}
              >
                {fmtPct(
                  pred.placement_probability
                )}
              </p>
            </div>

            {/* CTC */}
            <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-emerald-500/10">
                <BarChart3
                  size={30}
                  className="text-emerald-400"
                />
              </div>

              <p className="text-sm uppercase tracking-wider text-slate-400">
                Expected CTC
              </p>

              <p className="mt-4 text-6xl font-black text-emerald-400">
                {fmtCTC(
                  pred.predicted_ctc
                )}
              </p>
            </div>
          </div>

          {/* Feature Importance */}
          {fiData.length > 0 && (
            <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10">
                  <Brain className="text-cyan-400" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    AI Feature
                    Importance
                  </h3>

                  <p className="text-sm text-slate-400">
                    Factors affecting
                    your placement score
                  </p>
                </div>
              </div>

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={fiData}
                  layout="vertical"
                  margin={{
                    left: 80,
                  }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 40]}
                    tick={{
                      fill:
                        "#94A3B8",
                      fontSize: 11,
                    }}
                    unit="%"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{
                      fill:
                        "#CBD5E1",
                      fontSize: 11,
                    }}
                    width={90}
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
                    ) => [`${v}%`]}
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      0, 8, 8, 0,
                    ]}
                  >
                    {fiData.map(
                      (
                        _: any,
                        i: number
                      ) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? "#8B5CF6"
                              : i === 1
                              ? "#6366F1"
                              : "#3B82F6"
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() =>
              router.push(
                "/companies"
              )
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90"
          >
            See Company Matches
            <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </div>
  );
}