"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import {
  Upload,
  Check,
  X,
  Sparkles,
  FileText,
  Brain,
  ShieldCheck,
  Target,
  ArrowUpRight,
} from "lucide-react";

import { apiAnalyzeResume } from "@/lib/api";
import type { ResumeAnalysis } from "@/types";
import { cn } from "@/lib/utils";

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "text-xl font-black",
        score >= 70
          ? "text-emerald-400"
          : score >= 50
          ? "text-amber-400"
          : "text-rose-400"
      )}
    >
      {score}
      <span className="text-sm text-slate-500">/100</span>
    </span>
  );
}

export default function ResumePage() {
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setLoading(true);

    try {
      const data = await apiAnalyzeResume(file);

      setResult(data);

      toast.success("Resume analyzed successfully!");
    } catch {
      toast.error("Analysis failed — backend may not be running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxFiles: 1,
    });

  const TABS = [
    "Details",
    "AI Feedback",
    "Text Preview",
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            AI Resume Intelligence
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            Resume ATS Analyzer
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Upload your resume to receive ATS scoring,
            AI-powered suggestions, keyword analysis,
            and role matching insights.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "group relative overflow-hidden rounded-[32px] border-2 border-dashed p-12 text-center transition-all cursor-pointer",
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-slate-700 bg-slate-900/50 hover:border-purple-500/50"
        )}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Upload
              size={36}
              className="text-purple-400"
            />
          </div>

          {loading ? (
            <>
              <h3 className="text-xl font-bold text-white">
                Analyzing Resume...
              </h3>

              <p className="mt-2 text-slate-400">
                AI is evaluating your resume structure,
                ATS keywords, and profile fit.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-black text-white">
                Upload Your Resume
              </h3>

              <p className="mt-3 text-slate-400">
                Drag & drop your PDF resume here
                or click to browse.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-400">
                <ShieldCheck
                  size={15}
                  className="text-emerald-400"
                />
                PDF only • AI Powered Analysis
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
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
          {/* Role Card */}
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Detected Target Role
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {result.detected_role ||
                    "Not detected"}
                </h2>

                {result.suggested_roles?.length >
                  0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {result.suggested_roles.map(
                      (role) => (
                        <span
                          key={role}
                          className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300"
                        >
                          {role}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <p className="text-sm text-slate-400">
                  Role Confidence
                </p>

                <p className="mt-2 text-4xl font-black text-emerald-400">
                  {Math.round(
                    (result.role_confidence || 0) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              {
                label: "Sections",
                score:
                  result.sections.score,
                icon: FileText,
              },
              {
                label: "ATS Keywords",
                score: result.ats.score,
                icon: Target,
              },
              {
                label: "Power Verbs",
                score: result.verbs.score,
                icon: ArrowUpRight,
              },
              {
                label: "Contact",
                score:
                  result.contact.score,
                icon: ShieldCheck,
              },
              {
                label: "Quantification",
                score:
                  result.quantification
                    .score,
                icon: Brain,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-5 text-center backdrop-blur-xl"
                >
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <Icon
                      size={22}
                      className="text-purple-400"
                    />
                  </div>

                  <ScoreBadge
                    score={item.score}
                  />

                  <p className="mt-2 text-sm text-slate-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Overall Score */}
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Overall Resume Score
              </h3>

              <ScoreBadge
                score={
                  result.overall_score
                }
              />
            </div>

            <div className="h-5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${result.overall_score}%`,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Contact Checklist */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(
              [
                "email",
                "phone",
                "linkedin",
                "github",
              ] as const
            ).map((k) => (
              <div
                key={k}
                className="rounded-[24px] border border-slate-800 bg-slate-900/50 p-5 text-center"
              >
                <div
                  className={cn(
                    "mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl",
                    result.contact[k]
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  {result.contact[k] ? (
                    <Check size={22} />
                  ) : (
                    <X size={22} />
                  )}
                </div>

                <p className="capitalize text-slate-300">
                  {k}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-2">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(i)
                }
                className={cn(
                  "flex-1 rounded-xl py-3 text-sm font-semibold transition-all",
                  activeTab === i
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
            {activeTab === 0 && (
              <div className="space-y-5 text-sm">
                <div>
                  <p className="mb-2 text-slate-400">
                    Found Sections
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {result.sections
                      .found_sections
                      ?.length ? (
                      result.sections.found_sections.map(
                        (s: string) => (
                          <span
                            key={s}
                            className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                          >
                            {s}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-slate-500">
                        None detected
                      </span>
                    )}
                  </div>
                </div>

                {result.sections
                  .missing_sections
                  ?.length > 0 && (
                  <div>
                    <p className="mb-2 text-slate-400">
                      Missing Sections
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {result.sections.missing_sections.map(
                        (s: string) => (
                          <span
                            key={s}
                            className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300"
                          >
                            {s}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-slate-400">
                    ATS Keywords
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {result.ats
                      .matched_keywords
                      ?.length ? (
                      result.ats.matched_keywords.map(
                        (k: string) => (
                          <span
                            key={k}
                            className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
                          >
                            {k}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-slate-500">
                        No keywords matched
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300">
                <ReactMarkdown>
                  {result.gemini_feedback}
                </ReactMarkdown>
              </div>
            )}

            {activeTab === 2 && (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-400">
                {result.text_preview}
              </pre>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}