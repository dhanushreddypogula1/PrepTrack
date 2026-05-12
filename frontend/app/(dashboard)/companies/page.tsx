"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";

import {
  ChevronDown,
  ChevronRight,
  Building2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  ArrowRight,
} from "lucide-react";

import { useStore } from "@/store";

import { apiMatchAll } from "@/lib/api";

import {
  cn,
  TIER_COLORS,
  ELIGIBILITY_COLORS,
  fmtPct,
} from "@/lib/utils";

import type { CompanyMatch } from "@/types";

function CompanyCard({
  m,
}: {
  m: CompanyMatch;
}) {
  const [open, setOpen] = useState(false);

  const ec =
    ELIGIBILITY_COLORS[m.eligibility];

  const tc =
    TIER_COLORS[m.tier] ?? "";

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/50 backdrop-blur-xl"
    >
      <button
        onClick={() =>
          setOpen((o) => !o)
        }
        className="w-full p-5 text-left transition hover:bg-white/5"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          {/* Left */}
          <div className="flex flex-1 items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Building2 className="text-purple-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {m.company_name}
                </h3>

                <span
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs font-medium",
                    tc
                  )}
                >
                  {m.tier_label}
                </span>

                <span
                  className={cn(
                    "text-xs font-semibold",
                    ec
                  )}
                >
                  ●{" "}
                  {m.eligibility.replace(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>
                  Fit Score:{" "}
                  <span className="font-bold text-white">
                    {m.fit_score}/100
                  </span>
                </span>

                <span>
                  Probability:{" "}
                  <span className="font-bold text-white">
                    {fmtPct(
                      m.calibrated_probability
                    )}
                  </span>
                </span>

                <span>{m.ctc_range}</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div
              className="relative flex size-16 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#8B5CF6 ${m.fit_score}%, #1E293B 0)`,
              }}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-slate-950">
                <span className="text-sm font-black text-white">
                  {m.fit_score}
                </span>
              </div>
            </div>

            {open ? (
              <ChevronDown className="text-slate-400" />
            ) : (
              <ChevronRight className="text-slate-400" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="border-t border-slate-800 px-5 pb-5 pt-5">
              <p className="mb-5 text-sm leading-7 text-slate-400">
                {m.hiring_format_summary}
              </p>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Matched */}
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-emerald-400">
                    Matched Factors
                  </h4>

                  <div className="space-y-2">
                    {m.matched_factors
                      .slice(0, 3)
                      .map((f, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                        >
                          ✓ {f}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-rose-400">
                    Missing Factors
                  </h4>

                  <div className="space-y-2">
                    {m.missing_factors
                      .slice(0, 3)
                      .map((f, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                        >
                          ✕ {f}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Skill Gaps */}
              {m.skill_gaps.length >
                0 && (
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold text-white">
                    Skill Gaps
                  </h4>

                  <div className="space-y-3">
                    {m.skill_gaps
                      .slice(0, 3)
                      .map((g, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-2xl p-4 text-sm",
                            g.importance ===
                              "critical"
                              ? "border border-rose-500/10 bg-rose-500/10 text-rose-300"
                              : "border border-amber-500/10 bg-amber-500/10 text-amber-300"
                          )}
                        >
                          <div className="font-semibold">
                            {g.importance ===
                            "critical"
                              ? "🔴 Critical"
                              : "🟡 Moderate"}{" "}
                            • {g.skill}
                          </div>

                          <p className="mt-2 leading-6">
                            {g.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6">
                <Link
                  href={`/companies/${m.company_name
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Company Deep Dive
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CompaniesPage() {
  const {
    lastProfile: profile,
    lastPrediction: pred,
  } = useStore();

  const [filter, setFilter] =
    useState<
      "all" | "eligible" | "stretch"
    >("all");

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "companies",
      profile?.cgpa,
      profile?.dsa_score,
    ],

    queryFn: () =>
      apiMatchAll(
        profile!,
        pred!.placement_probability
      ),

    enabled: !!profile && !!pred,
  });

  if (!profile || !pred)
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
          Complete your placement
          assessment to unlock AI
          company matching insights.
        </p>

        <Link
          href="/assessment"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Start Assessment
          <ArrowRight size={18} />
        </Link>
      </div>
    );

  const all = data
    ? [
        ...(data.eligible ?? []),
        ...(data.stretch ?? []),
        ...(data.not_eligible ??
          []),
      ]
    : [];

  const shown =
    filter === "all"
      ? all
      : data?.[filter] ?? [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <Sparkles size={15} />
              AI Company Matching
            </div>

            <h1 className="text-4xl font-black text-white lg:text-5xl">
              Company Dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              Discover the best companies
              matching your placement
              profile, skills, and
              readiness level.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
              <p className="text-sm text-slate-400">
                Eligible
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-400">
                {data?.eligible.length ??
                  0}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">
              <p className="text-sm text-slate-400">
                Stretch
              </p>

              <p className="mt-2 text-3xl font-black text-amber-400">
                {data?.stretch.length ??
                  0}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center">
              <p className="text-sm text-slate-400">
                Not Eligible
              </p>

              <p className="mt-2 text-3xl font-black text-rose-400">
                {data?.not_eligible
                  .length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(
          [
            "all",
            "eligible",
            "stretch",
          ] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() =>
              setFilter(f)
            }
            className={cn(
              "rounded-2xl border px-5 py-3 text-sm font-semibold capitalize transition-all",
              filter === f
                ? "border-purple-500 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-purple-500/40 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[28px] border border-slate-800 bg-slate-900/50"
              />
            ))}
        </div>
      )}

      {/* Cards */}
      {shown.length > 0 && (
        <div className="space-y-4">
          {shown.map((m) => (
            <CompanyCard
              key={m.company_name}
              m={m}
            />
          ))}
        </div>
      )}
    </div>
  );
}