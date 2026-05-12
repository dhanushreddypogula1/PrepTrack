"use client";

import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { toast } from "sonner";

import {
  TrendingUp,
  Clock3,
  Target,
  Sparkles,
  Activity,
  Brain,
  Trophy,
  ArrowRight,
} from "lucide-react";

import {
  apiLogProgress,
  apiGetProgress,
} from "@/lib/api";

import type { ProgressLog } from "@/types";

const ACTIVITIES = [
  "DSA",
  "Mock Interview",
  "Resume Update",
  "Project",
  "Certification",
  "Aptitude",
  "Communication",
];

const COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
];

export default function ProgressPage() {
  const qc = useQueryClient();

  const { data: logs = [] } =
    useQuery<ProgressLog[]>({
      queryKey: ["progress"],
      queryFn: apiGetProgress,
    });

  const [form, setForm] =
    useState({
      activity_type: "DSA",
      description: "",
      duration_minutes: 60,
    });

  const { mutate, isPending } =
    useMutation({
      mutationFn: () =>
        apiLogProgress(form),

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: ["progress"],
        });

        toast.success(
          "Activity logged!"
        );

        setForm((f) => ({
          ...f,
          description: "",
        }));
      },

      onError: () =>
        toast.error(
          "Failed to log activity"
        ),
    });

  const pieData =
    ACTIVITIES.map((a, i) => ({
      name: a,
      value: logs
        .filter(
          (
            l: ProgressLog
          ) =>
            l.activity_type ===
            a
        )
        .reduce(
          (s, l) =>
            s +
            l.duration_minutes,
          0
        ),

      color: COLORS[i],
    })).filter(
      (d) => d.value > 0
    );

  const totalMinutes =
    pieData.reduce(
      (s, p) => s + p.value,
      0
    );

  const totalHours = (
    totalMinutes / 60
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 lg:p-10">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            Productivity Analytics
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            Progress Tracker
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Track your placement
            preparation activities,
            analyze consistency, and
            measure your growth
            journey with visual
            insights.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            label:
              "Total Activities",
            value: logs.length,
            icon: Activity,
            color:
              "from-purple-500/20 to-purple-500/5",
            text: "text-purple-400",
          },

          {
            label:
              "Hours Invested",
            value: totalHours,
            icon: Clock3,
            color:
              "from-blue-500/20 to-blue-500/5",
            text: "text-blue-400",
          },

          {
            label:
              "Top Focus Area",
            value:
              pieData[0]?.name ??
              "N/A",
            icon: Trophy,
            color:
              "from-emerald-500/20 to-emerald-500/5",
            text: "text-emerald-400",
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

      {/* Logger */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Target className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Log Activity
            </h2>

            <p className="mt-1 text-slate-400">
              Add preparation sessions
              and track consistency.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Activity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Activity Type
            </label>

            <select
              value={
                form.activity_type
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  activity_type:
                    e.target
                      .value,
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            >
              {ACTIVITIES.map(
                (a) => (
                  <option
                    key={a}
                  >
                    {a}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <input
              value={
                form.description
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  description:
                    e.target
                      .value,
                }))
              }
              placeholder="e.g. Solved DP problems"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Duration
            </label>

            <select
              value={
                form.duration_minutes
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  duration_minutes:
                    +e.target
                      .value,
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            >
              {[30, 60, 90, 120, 180, 240].map(
                (n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n} min
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          disabled={
            isPending ||
            !form.description
          }
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            "Saving..."
          ) : (
            <>
              Log Activity
              <ArrowRight
                size={20}
              />
            </>
          )}
        </button>
      </div>

      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                <Brain className="text-cyan-400" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  Time Distribution
                </h2>

                <p className="text-slate-400">
                  Where your preparation
                  time goes.
                </p>
              </div>
            </div>

            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                >
                  {pieData.map(
                    (
                      d,
                      i
                    ) => (
                      <Cell
                        key={i}
                        fill={
                          d.color
                        }
                      />
                    )
                  )}
                </Pie>

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
                    `${v} min`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Logs */}
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10">
              <TrendingUp className="text-purple-400" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Recent Logs
              </h2>

              <p className="text-slate-400">
                Your latest preparation
                activities.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {logs.length > 0 ? (
              logs
                .slice(0, 12)
                .map(
                  (
                    l: ProgressLog
                  ) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                    >
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-black text-white">
                        {
                          l.activity_type[0]
                        }
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {
                            l.activity_type
                          }
                        </p>

                        <p className="truncate text-sm text-slate-400">
                          {
                            l.description
                          }
                        </p>
                      </div>

                      <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                        {
                          l.duration_minutes
                        }
                        m
                      </div>
                    </div>
                  )
                )
            ) : (
              <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700">
                <Activity className="mb-4 text-slate-600" />

                <p className="text-lg font-semibold text-slate-400">
                  No activities yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Start tracking your
                  preparation progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}