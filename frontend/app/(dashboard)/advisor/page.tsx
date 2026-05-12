"use client";

import { useState } from "react";

import { toast } from "sonner";

import ReactMarkdown from "react-markdown";

import Link from "next/link";

import {
  Sparkles,
  Brain,
  AlertCircle,
  ArrowRight,
  Wand2,
  Target,
  FileText,
} from "lucide-react";

import { useStore } from "@/store";

import {
  apiAdvisorReport,
  apiRoadmap,
  apiBullet,
} from "@/lib/api";

import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Full Report",
    icon: Brain,
  },

  {
    label: "30/60/90 Roadmap",
    icon: Target,
  },

  {
    label: "Resume Bullet",
    icon: FileText,
  },
];

export default function AdvisorPage() {
  const {
    lastProfile: profile,
    lastPrediction: pred,
  } = useStore();

  const [tab, setTab] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [outputs, setOutputs] =
    useState<
      Record<number, string>
    >({});

  const [target, setTarget] =
    useState(
      "top product companies (Amazon/Microsoft)"
    );

  const [bullet, setBullet] =
    useState("");

  async function generate() {
    if (!profile || !pred)
      return;

    setLoading(true);

    try {
      let text = "";

      if (tab === 0) {
        text =
          await apiAdvisorReport(
            profile,
            pred.placement_probability,
            pred.predicted_ctc
          );
      } else if (tab === 1) {
        text =
          await apiRoadmap(
            profile,
            target
          );
      } else {
        text =
          await apiBullet(
            bullet
          );
      }

      setOutputs((o) => ({
        ...o,
        [tab]: text,
      }));
    } catch {
      toast.error(
        "Gemini request failed"
      );
    } finally {
      setLoading(false);
    }
  }

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
          assessment to unlock
          personalized AI guidance,
          roadmaps, and resume
          intelligence.
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 lg:p-10">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            Gemini AI Powered
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            AI Placement Advisor
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Generate personalized
            placement reports,
            company preparation
            roadmaps, and resume
            optimization suggestions
            tailored to your profile.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid gap-4 lg:grid-cols-3">
        {TABS.map((t, i) => {
          const Icon = t.icon;

          const active =
            tab === i;

          return (
            <button
              key={t.label}
              onClick={() =>
                setTab(i)
              }
              className={cn(
                "group rounded-[28px] border p-6 text-left transition-all",
                active
                  ? "border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-blue-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:border-purple-500/20 hover:bg-white/[0.03]"
              )}
            >
              <div
                className={cn(
                  "mb-5 flex size-14 items-center justify-center rounded-2xl transition-all",
                  active
                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:text-white"
                )}
              >
                <Icon size={26} />
              </div>

              <h3 className="text-lg font-bold text-white">
                {t.label}
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                {i === 0 &&
                  "Generate a complete AI analysis of your placement profile."}

                {i === 1 &&
                  "Receive a structured preparation roadmap for target companies."}

                {i === 2 &&
                  "Improve weak resume bullets into strong ATS-friendly points."}
              </p>
            </button>
          );
        })}
      </div>

      {/* Generator */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Wand2 className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              AI Generator
            </h2>

            <p className="mt-1 text-slate-400">
              Personalized using your
              assessment data and
              placement profile.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {tab === 1 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Target Company /
                Category
              </label>

              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
                value={target}
                onChange={(e) =>
                  setTarget(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {tab === 2 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Paste Weak Resume
                Bullet
              </label>

              <textarea
                className="h-32 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
                placeholder="e.g. Worked on a web project..."
                value={bullet}
                onChange={(e) =>
                  setBullet(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          <button
            onClick={generate}
            disabled={
              loading ||
              (tab === 2 &&
                !bullet.trim())
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              "Generating with Gemini..."
            ) : (
              <>
                {tab === 0 &&
                  "Generate Full Report"}

                {tab === 1 &&
                  "Generate Roadmap"}

                {tab === 2 &&
                  "Improve Resume Bullet"}

                <ArrowRight
                  size={20}
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output */}
      {outputs[tab] && (
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Brain className="text-purple-400" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                AI Generated Output
              </h2>

              <p className="text-slate-400">
                Personalized insights
                powered by Gemini AI.
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
            <ReactMarkdown>
              {outputs[tab]}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}