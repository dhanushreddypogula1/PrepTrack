"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Code2,
  AlertCircle,
  Sparkles,
  Brain,
  Target,
  ArrowRight,
  Trophy,
  Flame,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import Link from "next/link";

import { StatCard } from "@/components/StatCard";

import { RadarChart } from "@/components/RadarChart";

import { useStore } from "@/store";

import {
  apiHistory,
  apiLeetcode,
} from "@/lib/api";

import {
  fmtPct,
  fmtCTC,
} from "@/lib/utils";

export default function DashboardPage() {
  const {
    lastPrediction: pred,
    lastProfile: profile,
    user,
  } = useStore();

  const [leetcode, setLeetcode] =
    useState<any>(null);

  useEffect(() => {
    async function loadLC() {
      try {
        const data =
          await apiLeetcode(
            "tourist"
          );

        setLeetcode(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadLC();
  }, []);

  const { data: history = [] } =
    useQuery({
      queryKey: ["history"],
      queryFn: apiHistory,
    });

  const radarData = profile
    ? [
        {
          subject: "CGPA",
          value:
            ((profile.cgpa -
              5) /
              5) *
            100,
        },

        {
          subject: "DSA",
          value:
            profile.dsa_score,
        },

        {
          subject: "Projects",
          value: Math.min(
            (profile.projects /
              5) *
              100,
            100
          ),
        },

        {
          subject:
            "Communication",
          value:
            profile.communication_score,
        },

        {
          subject:
            "Aptitude",
          value:
            profile.aptitude_score,
        },

        {
          subject: "Resume",
          value:
            profile.resume_score,
        },
      ]
    : [];

  const trendData = [
    ...history,
  ]
    .reverse()
    .map(
      (
        a: any,
        i: number
      ) => ({
        name: `#${
          i + 1
        }`,
        prob:
          a.placement_probability,
        ctc:
          a.predicted_ctc,
      })
    );

  if (!pred) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center rounded-[32px] border border-slate-800 bg-slate-900/50 p-10 text-center">
        <div className="mb-5 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <AlertCircle
            size={42}
            className="text-amber-400"
          />
        </div>

        <h2 className="text-3xl font-black text-white">
          No Assessment Yet
        </h2>

        <p className="mt-3 max-w-md text-slate-400">
          Run your first
          placement assessment
          to unlock your
          analytics dashboard,
          AI insights, and
          company predictions.
        </p>

        <Link
          href="/assessment"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Start Assessment
          <ArrowRight
            size={18}
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <Sparkles
                size={15}
              />
              AI Placement
              Dashboard
            </div>

            <h1 className="text-4xl font-black text-white lg:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {
                  user?.username
                }
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Track your
              placement
              readiness, monitor
              improvements, and
              receive AI-powered
              insights for better
              preparation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">
                Placement
                Probability
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {fmtPct(
                  pred.placement_probability
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">
                Expected CTC
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {fmtCTC(
                  pred.predicted_ctc
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Placement Probability"
          value={fmtPct(
            pred.placement_probability
          )}
          icon={BarChart2}
          color="violet"
          trend={
            history.length > 1
              ? pred.placement_probability -
                history[1]
                  ?.placement_probability
              : undefined
          }
        />

        <StatCard
          title="Expected CTC"
          value={fmtCTC(
            pred.predicted_ctc
          )}
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title="DSA Score"
          value={`${
            profile?.dsa_score ??
            0
          }/100`}
          icon={Code2}
          color="blue"
        />

        <StatCard
          title="Assessments Done"
          value={history.length}
          icon={TrendingUp}
          color="amber"
          sub="total assessments"
        />
      </div>

      {/* LeetCode Intelligence */}
      {leetcode && (
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-yellow-500/10">
                <Code2
                  className="text-yellow-400"
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  LeetCode
                  Intelligence
                </h2>

                <p className="text-sm text-slate-400">
                  Real-time DSA
                  analytics
                </p>
              </div>
            </div>

            <Link
              href="/leetcode"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
            >
              View Analytics
              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                Problems Solved
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                {
                  leetcode
                    .solved
                    ?.all
                }
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                Contest Rating
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                {Math.round(
                  leetcode
                    .contest
                    ?.rating ||
                    0
                )}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                Medium Solved
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                {
                  leetcode
                    .solved
                    ?.medium
                }
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">
                Hard Solved
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                {
                  leetcode
                    .solved
                    ?.hard
                }
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Radar */}
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
              <Target
                className="text-purple-400"
                size={22}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Skills Radar
              </h2>

              <p className="text-sm text-slate-400">
                Your preparation
                overview
              </p>
            </div>
          </div>

          {radarData.length >
          0 ? (
            <RadarChart
              data={
                radarData
              }
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Complete an
              assessment to
              unlock analytics.
            </div>
          )}
        </div>

        {/* Trend */}
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
              <TrendingUp
                className="text-blue-400"
                size={22}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Progress Trend
              </h2>

              <p className="text-sm text-slate-400">
                Track your
                placement growth
              </p>
            </div>
          </div>

          {trendData.length >
          1 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={trendData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  domain={[
                    0, 100,
                  ]}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
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
                />

                <Line
                  type="monotone"
                  dataKey="prob"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{
                    fill:
                      "#8B5CF6",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                  name="Probability %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Run 2+
              assessments to
              visualize
              progress.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}