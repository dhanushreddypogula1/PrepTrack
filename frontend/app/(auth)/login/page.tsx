"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { toast } from "sonner";

import {
  Sparkles,
  Lock,
  User,
  Mail,
  ArrowRight,
  Brain,
} from "lucide-react";

import { useStore } from "@/store";

import {
  apiLogin,
  apiRegister,
} from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const { setUser } =
    useStore();

  const [tab, setTab] =
    useState<
      "login" | "register"
    >("login");

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      username: "",
      email: "",
      password: "",
      confirm: "",
    });

  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.value,
      }));

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      tab === "register" &&
      form.password !==
        form.confirm
    ) {
      toast.error(
        "Passwords do not match"
      );

      return;
    }

    setLoading(true);

    try {
      const res =
        tab === "login"
          ? await apiLogin(
              form.username,
              form.password
            )
          : await apiRegister(
              form.username,
              form.email,
              form.password
            );

      setUser(
        res.user,
        res.access_token
      );

      document.cookie = `pt_token=${res.access_token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`;

      toast.success(
        tab === "login"
          ? "Welcome back!"
          : "Account created!"
      );

      router.push("/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data
          ?.detail ??
          "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Left */}
      <div className="relative hidden flex-1 flex-col justify-between border-r border-slate-800 p-12 lg:flex">
        <div>
          <div className="inline-flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
              <Sparkles
                className="text-white"
                size={28}
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white">
                PrepTrack
              </h1>

              <p className="text-sm text-slate-400">
                AI Placement Platform
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-xl">
            <h2 className="text-6xl font-black leading-tight text-white">
              Crack placements
              with AI-powered
              intelligence.
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Analyze your profile,
              predict company
              matches, improve
              placement readiness,
              and receive AI-driven
              preparation guidance.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label:
                "Predictions",
              value: "50K+",
            },
            {
              label:
                "Students",
              value: "12K+",
            },
            {
              label:
                "Companies",
              value: "250+",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl"
            >
              <p className="text-3xl font-black text-white">
                {s.value}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-[520px]">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
              <Sparkles
                className="text-white"
                size={24}
              />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                PrepTrack
              </h1>

              <p className="text-xs text-slate-400">
                AI Placement
                Platform
              </p>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-2xl">
            {/* Tabs */}
            <div className="mb-8 flex rounded-2xl border border-slate-800 bg-slate-950 p-1">
              {(
                [
                  "login",
                  "register",
                ] as const
              ).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    setTab(t)
                  }
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                    tab === t
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Brain className="text-purple-400" />
              </div>

              <h2 className="text-3xl font-black text-white">
                {tab === "login"
                  ? "Welcome back"
                  : "Create account"}
              </h2>

              <p className="mt-2 text-slate-400">
                {tab === "login"
                  ? "Sign in to continue your placement journey."
                  : "Start your AI-powered placement preparation."}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Username
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-purple-500">
                  <User
                    size={18}
                    className="text-slate-500"
                  />

                  <input
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                    placeholder="Enter username"
                    value={
                      form.username
                    }
                    onChange={set(
                      "username"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              {tab ===
                "register" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-purple-500">
                    <Mail
                      size={18}
                      className="text-slate-500"
                    />

                    <input
                      type="email"
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="you@example.com"
                      value={
                        form.email
                      }
                      onChange={set(
                        "email"
                      )}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-purple-500">
                  <Lock
                    size={18}
                    className="text-slate-500"
                  />

                  <input
                    type="password"
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                    placeholder="••••••••"
                    value={
                      form.password
                    }
                    onChange={set(
                      "password"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Confirm */}
              {tab ===
                "register" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Confirm
                    Password
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 transition focus-within:border-purple-500">
                    <Lock
                      size={18}
                      className="text-slate-500"
                    />

                    <input
                      type="password"
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="••••••••"
                      value={
                        form.confirm
                      }
                      onChange={set(
                        "confirm"
                      )}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  "Please wait..."
                ) : (
                  <>
                    {tab ===
                    "login"
                      ? "Sign In"
                      : "Create Account"}

                    <ArrowRight
                      size={20}
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}