"use client";

import { useState } from "react";

import axios from "axios";

import { toast } from "sonner";

import {
  User,
  Lock,
  LogOut,
  Sparkles,
  ShieldCheck,
  Mail,
  KeyRound,
  Settings,
} from "lucide-react";

import { useStore } from "@/store";

export default function SettingsPage() {
  const { user, token, setUser } =
    useStore();

  const [oldPwd, setOldPwd] =
    useState("");

  const [newPwd, setNewPwd] =
    useState("");

  const [conf, setConf] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const API =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  async function changePwd(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (newPwd !== conf) {
      toast.error(
        "Passwords don't match"
      );

      return;
    }

    if (newPwd.length < 6) {
      toast.error(
        "Minimum 6 characters required"
      );

      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API}/api/auth/change-password`,
        {
          old_password: oldPwd,
          new_password: newPwd,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Password updated!"
      );

      setOldPwd("");
      setNewPwd("");
      setConf("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ??
          "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null, null);

    document.cookie =
      "pt_token=; max-age=0; path=/";

    window.location.href =
      "/login";
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles size={15} />
            Account Management
          </div>

          <h1 className="text-4xl font-black text-white lg:text-5xl">
            Settings
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Manage your profile,
            account security, and
            authentication settings.
          </p>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <User className="text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Profile Information
            </h2>

            <p className="text-slate-400">
              Your account details and
              login information
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Username */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-purple-500/10">
              <User className="text-purple-400" />
            </div>

            <p className="text-sm text-slate-400">
              Username
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              {user?.username ?? "—"}
            </h3>
          </div>

          {/* Email */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-blue-500/10">
              <Mail className="text-blue-400" />
            </div>

            <p className="text-sm text-slate-400">
              Email Address
            </p>

            <h3 className="mt-2 break-all text-lg font-bold text-white">
              {user?.email ?? "—"}
            </h3>
          </div>

          {/* Provider */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <ShieldCheck className="text-emerald-400" />
            </div>

            <p className="text-sm text-slate-400">
              Authentication Provider
            </p>

            <h3 className="mt-2 text-xl font-bold capitalize text-white">
              {user?.provider ??
                "local"}
            </h3>
          </div>
        </div>
      </div>

      {/* Password */}
      {user?.provider === "local" ||
      !user?.provider ? (
        <form
          onSubmit={changePwd}
          className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <KeyRound className="text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Change Password
              </h2>

              <p className="text-slate-400">
                Update your account
                password securely
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                label:
                  "Current Password",
                val: oldPwd,
                set: setOldPwd,
              },
              {
                label:
                  "New Password",
                val: newPwd,
                set: setNewPwd,
              },
              {
                label:
                  "Confirm Password",
                val: conf,
                set: setConf,
              },
            ].map(
              ({
                label,
                val,
                set,
              }) => (
                <div key={label}>
                  <label className="mb-3 block text-sm font-medium text-slate-300">
                    {label}
                  </label>

                  <input
                    type="password"
                    value={val}
                    onChange={(e) =>
                      set(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500"
                  />
                </div>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Lock size={18} />

            {loading
              ? "Updating Password..."
              : "Update Password"}
          </button>
        </form>
      ) : (
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-amber-500/10">
              <Settings className="text-amber-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                External Provider
              </h2>

              <p className="mt-3 max-w-2xl text-slate-400">
                You signed in using{" "}
                <span className="font-semibold capitalize text-purple-400">
                  {user?.provider}
                </span>
                . Password changes are
                managed externally through
                your authentication
                provider.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-lg font-semibold text-rose-400 transition hover:bg-rose-500/20"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}