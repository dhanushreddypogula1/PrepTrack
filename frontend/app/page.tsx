"use client";

import Link from "next/link";

import {
  ArrowRight,
  Brain,
  Building2,
  FileText,
  MessageSquare,
  Target,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Star,
  Zap,
  BarChart3,
  Trophy,
  ShieldCheck,
  Code2,
  Flame,
} from "lucide-react";

import { motion } from "framer-motion";

import { useStore } from "@/store";

const features = [
  {
    icon: Target,
    title: "Placement Readiness",
    description:
      "AI-powered assessment to evaluate your skills across DSA, aptitude, and interviews.",
  },

  {
    icon: FileText,
    title: "Resume ATS Analyzer",
    description:
      "Optimize your resume with intelligent ATS scoring and AI recommendations.",
  },

  {
    icon: Building2,
    title: "Smart Company Matching",
    description:
      "Get matched with companies that align with your skills and profile.",
  },

  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "Practice with AI-powered interviews and improve communication confidence.",
  },

  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description:
      "Identify weak areas and receive personalized improvement roadmaps.",
  },

  {
    icon: Brain,
    title: "AI Career Advisor",
    description:
      "24/7 AI assistant for placement guidance, preparation, and strategy.",
  },
];

const stats = [
  {
    label: "Placement Accuracy",
    value: "92%",
    icon: Trophy,
  },

  {
    label: "AI Insights Generated",
    value: "50K+",
    icon: Brain,
  },

  {
    label: "Companies Supported",
    value: "120+",
    icon: Building2,
  },

  {
    label: "Problems Analyzed",
    value: "1M+",
    icon: Code2,
  },
];

const steps = [
  {
    number: "01",
    title: "Take Assessment",
    description:
      "Evaluate your placement readiness with AI-powered analysis.",
    icon: Target,
  },

  {
    number: "02",
    title: "Get AI Insights",
    description:
      "Receive personalized learning recommendations and preparation plans.",
    icon: Brain,
  },

  {
    number: "03",
    title: "Practice & Improve",
    description:
      "Use mock interviews, resume analyzer, and skill tracking tools.",
    icon: TrendingUp,
  },

  {
    number: "04",
    title: "Get Placed",
    description:
      "Apply confidently and crack your dream placement opportunity.",
    icon: Award,
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "SDE @ Google",
    image: "👩‍💻",
    content:
      "PrepTrack helped me structure my placement preparation effectively.",
  },

  {
    name: "Rahul Kumar",
    role: "SDE @ Microsoft",
    image: "👨‍💻",
    content:
      "The AI advisor and resume analyzer significantly improved my placement readiness.",
  },

  {
    name: "Sneha Patel",
    role: "SDE @ Amazon",
    image: "👩‍🎓",
    content:
      "The mock interviews and company matching features were game changers.",
  },
];

export default function HomePage() {
  const { user, setUser } = useStore();

  const isLoggedIn = !!user;

  function logout() {
    setUser(null, null);
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[500px] rounded-full bg-purple-500/20 blur-3xl lg:size-[700px]" />

        <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-blue-500/20 blur-3xl lg:size-[700px]" />

        <div className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl lg:size-[800px]" />
      </div>

      {/* Navbar */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20">
              <Sparkles className="size-6 text-white" />
            </div>

            <div>
              <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-black text-transparent">
                PrepTrack
              </h1>

              <p className="text-xs text-slate-400">
                Placement Intelligence
              </p>
            </div>
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-300 transition hover:border-purple-500/40 hover:text-white sm:flex"
              >
                <User size={15} />
                Profile
              </Link>

              <Link
                href="/dashboard"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-400 transition hover:text-rose-400"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:text-white sm:block"
              >
                Login
              </Link>

              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
                <Sparkles className="size-4" />
                AI-Powered Placement Platform
              </div>

              <h1 className="text-5xl font-black leading-tight lg:text-7xl">
                {isLoggedIn ? (
                  <>
                    Welcome back,
                    <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {user.username}
                    </span>
                  </>
                ) : (
                  <>
                    Your
                    <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Dream Placement
                    </span>
                    Starts Here
                  </>
                )}
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 lg:text-xl">
                PrepTrack combines AI-powered assessments, LeetCode analytics,
                resume intelligence, mock interviews, and company matching into
                one modern placement preparation platform.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:opacity-90"
                >
                  {isLoggedIn
                    ? "Open Dashboard"
                    : "Start Your Journey"}

                  <ArrowRight size={20} />
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-lg font-semibold text-slate-300 transition hover:border-purple-500/40 hover:text-white"
                  >
                    Login
                  </Link>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-400" />
                  AI Placement Prediction
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-400" />
                  LeetCode Analytics
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-400" />
                  Resume Intelligence
                </div>
              </div>
            </motion.div>

            {/* Hero Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="rounded-[36px] border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Overall Readiness
                    </p>

                    <h2 className="mt-2 text-5xl font-black text-white">
                      84%
                    </h2>
                  </div>

                  <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600">
                    <Zap className="size-8 text-white" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <div className="flex items-center gap-3">
                      <Code2 className="text-yellow-400" />

                      <div>
                        <p className="text-sm text-slate-400">
                          LeetCode Solved
                        </p>

                        <h3 className="text-2xl font-black text-white">
                          412
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <div className="flex items-center gap-3">
                      <Flame className="text-orange-400" />

                      <div>
                        <p className="text-sm text-slate-400">
                          Contest Rating
                        </p>

                        <h3 className="text-2xl font-black text-white">
                          1782
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-emerald-400" />

                      <div>
                        <p className="text-sm text-slate-400">
                          Placement Chance
                        </p>

                        <h3 className="text-2xl font-black text-white">
                          91%
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-cyan-400" />

                      <div>
                        <p className="text-sm text-slate-400">
                          Resume Score
                        </p>

                        <h3 className="text-2xl font-black text-white">
                          88
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-4xl font-black text-white">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              Features
            </p>

            <h2 className="text-4xl font-black lg:text-5xl">
              Everything You Need to Succeed
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              Comprehensive placement preparation tools powered by AI.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  whileHover={{ y: -6 }}
                  key={feature.title}
                  className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6 transition hover:border-purple-500/40"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="relative bg-slate-900/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Process
            </p>

            <h2 className="text-4xl font-black lg:text-5xl">
              How It Works
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6"
                >
                  <p className="text-6xl font-black text-purple-500/20">
                    {step.number}
                  </p>

                  <div className="mt-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-slate-400">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              Testimonials
            </p>

            <h2 className="text-4xl font-black lg:text-5xl">
              Success Stories
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="italic leading-7 text-slate-300">
                  "{testimonial.content}"
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-2xl">
                    {testimonial.image}
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>

                    <p className="text-sm text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[36px] border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-blue-950/50 p-10 text-center lg:p-14">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600">
              <Zap className="size-10 text-white" />
            </div>

            <h2 className="text-4xl font-black lg:text-5xl">
              Ready to Ace Your Placements?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Join thousands of students preparing smarter with PrepTrack.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:opacity-90"
              >
                Start Now
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-slate-400 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                Free to start
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                AI-powered guidance
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                Placement-focused platform
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

