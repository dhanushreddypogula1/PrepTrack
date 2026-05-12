"use client";

import { useState } from "react";

import { toast } from "sonner";

import {
  Brain,
  Sparkles,
  Target,
  Clock3,
  Mic,
  ArrowRight,
  Wand2,
  Trophy,
} from "lucide-react";

import {
  apiInterviewQ,
  apiInterviewEval,
} from "@/lib/api";

import { cn } from "@/lib/utils";

const DOMAINS = [
  "Technical DSA",
  "OOP/DBMS/OS",
  "HR Behavioral",
  "System Design",
  "Python/Java",
];

const COMPANIES = [
  "General",
  "Amazon",
  "Google",
  "Microsoft",
  "TCS",
  "Infosys",
];

const DIFFS = [
  "Easy",
  "Medium",
  "Hard",
];

export default function InterviewPage() {
  const [domain, setDomain] =
    useState(DOMAINS[0]);

  const [company, setCompany] =
    useState("General");

  const [diff, setDiff] =
    useState("Medium");

  const [question, setQuestion] =
    useState<any>(null);

  const [answer, setAnswer] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  async function genQ() {
    setLoading(true);

    setEvaluation(null);

    setAnswer("");

    setQuestion(null);

    try {
      const q =
        await apiInterviewQ(
          domain,
          company === "General"
            ? ""
            : company,
          diff
        );

      setQuestion(q);
    } catch {
      toast.error(
        "Failed to generate question"
      );
    } finally {
      setLoading(false);
    }
  }

  async function evaluate() {
    if (
      !question?.question ||
      !answer.trim()
    )
      return;

    setLoading(true);

    try {
      const ev =
        await apiInterviewEval(
          question.question,
          answer,
          domain
        );

      setEvaluation(ev);
    } catch {
      toast.error(
        "Evaluation failed"
      );
    } finally {
      setLoading(false);
    }
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
            Gemini AI Interviewer
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            AI Mock Interview
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Practice technical,
            behavioral, and company
            specific interviews with
            AI-generated questions
            and intelligent answer
            evaluation.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Mic className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Interview Setup
            </h2>

            <p className="mt-1 text-slate-400">
              Customize your mock
              interview experience.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Domain */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Domain
            </label>

            <select
              value={domain}
              onChange={(e) =>
                setDomain(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            >
              {DOMAINS.map((d) => (
                <option
                  key={d}
                >
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Company
            </label>

            <select
              value={company}
              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            >
              {COMPANIES.map(
                (c) => (
                  <option
                    key={c}
                  >
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Difficulty
            </label>

            <select
              value={diff}
              onChange={(e) =>
                setDiff(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-purple-500"
            >
              {DIFFS.map((d) => (
                <option
                  key={d}
                >
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={genQ}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            "Generating..."
          ) : (
            <>
              Generate Interview
              Question
              <ArrowRight
                size={20}
              />
            </>
          )}
        </button>
      </div>

      {/* Question */}
      {question && (
        <div className="space-y-8">
          {/* Question Card */}
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                {domain}
              </span>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                {company}
              </span>

              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  diff === "Hard"
                    ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                    : diff ===
                      "Medium"
                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                    : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                )}
              >
                {diff}
              </span>

              <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                <Clock3
                  size={14}
                />
                {
                  question.time_limit
                }{" "}
                min
              </span>
            </div>

            <h2 className="text-2xl font-black leading-relaxed text-white">
              {
                question.question
              }
            </h2>

            {question.hint && (
              <details className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <summary className="cursor-pointer text-sm font-semibold text-purple-400">
                  Show Hint
                </summary>

                <p className="mt-4 leading-7 text-slate-400">
                  {
                    question.hint
                  }
                </p>
              </details>
            )}

            {question.topics && (
              <div className="mt-6 flex flex-wrap gap-2">
                {String(
                  question.topics
                )
                  .split(",")
                  .map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Answer */}
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Wand2 className="text-purple-400" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Your Answer
                </h2>

                <p className="text-slate-400">
                  Write your response
                  and get AI evaluation.
                </p>
              </div>
            </div>

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(
                  e.target.value
                )
              }
              className="h-56 w-full resize-none rounded-3xl border border-slate-700 bg-slate-950 px-5 py-5 text-white outline-none transition focus:border-purple-500"
              placeholder="Explain your answer here..."
            />

            <button
              onClick={evaluate}
              disabled={
                loading ||
                !answer.trim()
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                "Evaluating..."
              ) : (
                <>
                  Evaluate Answer
                  <ArrowRight
                    size={20}
                  />
                </>
              )}
            </button>
          </div>

          {/* Evaluation */}
          {evaluation && (
            <div className="space-y-6">
              {/* Score */}
              <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <Trophy className="text-purple-400" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white">
                      Interview Score
                    </h2>

                    <p className="text-slate-400">
                      AI evaluation of
                      your response.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-6xl font-black text-purple-400">
                    {
                      evaluation.score
                    }
                    <span className="text-2xl text-slate-500">
                      /10
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
                        style={{
                          width: `${
                            (parseInt(
                              evaluation.score
                            ) /
                              10) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weakness */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[32px] border border-emerald-500/10 bg-emerald-500/5 p-6">
                  <h3 className="mb-4 text-xl font-bold text-emerald-400">
                    Strengths
                  </h3>

                  <p className="leading-8 text-slate-300">
                    {
                      evaluation.strengths
                    }
                  </p>
                </div>

                <div className="rounded-[32px] border border-rose-500/10 bg-rose-500/5 p-6">
                  <h3 className="mb-4 text-xl font-bold text-rose-400">
                    Weaknesses
                  </h3>

                  <p className="leading-8 text-slate-300">
                    {
                      evaluation.weaknesses
                    }
                  </p>
                </div>
              </div>

              {/* Model Answer */}
              {evaluation.improved_answer && (
                <div className="rounded-[32px] border border-blue-500/10 bg-blue-500/5 p-8">
                  <h3 className="mb-5 text-2xl font-black text-blue-300">
                    Model Answer
                  </h3>

                  <p className="leading-8 text-slate-300">
                    {
                      evaluation.improved_answer
                    }
                  </p>
                </div>
              )}

              {/* Tips */}
              {evaluation.tips && (
                <div className="rounded-[32px] border border-amber-500/10 bg-amber-500/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10">
                      <Target className="text-amber-400" />
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-bold text-amber-300">
                        Improvement Tips
                      </h3>

                      <p className="leading-8 text-slate-300">
                        {
                          evaluation.tips
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}