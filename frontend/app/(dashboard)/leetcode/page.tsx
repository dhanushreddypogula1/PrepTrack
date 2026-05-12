"use client";

import { useState } from "react";

import axios from "axios";

import {
  Trophy,
  Code2,
  Flame,
  Brain,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const API =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export default function LeetCodePage() {
  const [username, setUsername] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<any>(null);

  const [error, setError] =
    useState("");

  async function fetchProfile() {
    if (!username.trim())
      return;

    setLoading(true);

    setError("");

    try {
      const res = await axios.get(
        `${API}/api/leetcode/${username}`
      );

      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.detail ||
          "Failed to fetch profile"
      );
    } finally {
      setLoading(false);
    }
  }

  const solved =
    data?.solved || {};

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 lg:p-10">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
            <Sparkles size={15} />
            AI DSA Analytics
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            LeetCode Intelligence
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Analyze coding profile,
            contest performance,
            topic strengths, and
            placement readiness
            using real LeetCode
            analytics.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 focus-within:border-yellow-500">
            <Search
              className="text-slate-500"
              size={20}
            />

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Enter LeetCode username..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={fetchProfile}
            disabled={
              loading ||
              !username.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Analyzing..."
              : "Analyze Profile"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-400">
            {error}
          </p>
        )}
      </div>

      {/* Data */}
      {data && (
        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid gap-6 lg:grid-cols-4">
            {[
              {
                label:
                  "Total Solved",
                value:
                  solved.all,
                icon: Code2,
                color:
                  "text-yellow-400",
              },

              {
                label:
                  "Contest Rating",
                value:
                  Math.round(
                    data
                      .contest
                      ?.rating || 0
                  ),
                icon: Trophy,
                color:
                  "text-orange-400",
              },

              {
                label:
                  "Global Rank",
                value:
                  data.contest
                    ?.globalRanking ||
                  "N/A",
                icon: TrendingUp,
                color:
                  "text-cyan-400",
              },

              {
                label:
                  "Contests",
                value:
                  data.contest
                    ?.attended ||
                  0,
                icon: Flame,
                color:
                  "text-rose-400",
              },
            ].map((s) => {
              const Icon = s.icon;

              return (
                <div
                  key={s.label}
                  className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-slate-800">
                    <Icon
                      className={
                        s.color
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

          {/* Difficulty */}
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                label: "Easy",
                value:
                  solved.easy,
                color:
                  "from-emerald-500 to-green-500",
              },

              {
                label:
                  "Medium",
                value:
                  solved.medium,
                color:
                  "from-amber-500 to-orange-500",
              },

              {
                label: "Hard",
                value:
                  solved.hard,
                color:
                  "from-rose-500 to-red-500",
              },
            ].map((d) => (
              <div
                key={d.label}
                className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
              >
                <div
                  className={`mb-5 h-3 rounded-full bg-gradient-to-r ${d.color}`}
                />

                <p className="text-sm uppercase tracking-wider text-slate-400">
                  {d.label}
                </p>

                <h2 className="mt-3 text-5xl font-black text-white">
                  {d.value}
                </h2>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-yellow-500/10">
                <Brain className="text-yellow-400" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  AI Insights
                </h2>

                <p className="text-slate-400">
                  Generated from your
                  coding profile.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-slate-300">
              <p>
                • You have solved{" "}
                <span className="font-bold text-white">
                  {solved.all}
                </span>{" "}
                problems overall.
              </p>

              <p>
                • Your strongest
                level appears to be{" "}
                <span className="font-bold text-white">
                  {solved.medium >
                  solved.easy
                    ? "Medium"
                    : "Easy"}
                </span>{" "}
                problems.
              </p>

              <p>
                • Contest rating
                indicates{" "}
                <span className="font-bold text-white">
                  {data.contest
                    ?.rating >
                  1800
                    ? "advanced"
                    : data.contest
                        ?.rating >
                      1500
                    ? "intermediate"
                    : "developing"}
                </span>{" "}
                DSA ability.
              </p>

              <p>
                • Recommended next
                focus:
                {" "}
                <span className="font-bold text-yellow-300">
                  Dynamic
                  Programming &
                  Graphs
                </span>
              </p>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-black text-white">
              Recent Submissions
            </h2>

            <div className="space-y-3">
              {data.recentSubmissions
                ?.slice(0, 10)
                .map(
                  (
                    s: any,
                    i: number
                  ) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {s.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            s.lang
                          }
                        </p>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          s.statusDisplay ===
                          "Accepted"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {
                          s.statusDisplay
                        }
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}