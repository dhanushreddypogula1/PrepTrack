"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  LayoutDashboard,
  BarChart2,
  Sliders,
  Lightbulb,
  Building2,
  MessageSquare,
  FileText,
  Mic,
  TrendingUp,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  Code2,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";

import { useStore } from "@/store";

const NAV = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },

  {
    href: "/assessment",
    icon: BarChart2,
    label: "Assessment",
  },

  {
    href: "/simulator",
    icon: Sliders,
    label: "Simulator",
  },

  {
    href: "/advisor",
    icon: Lightbulb,
    label: "AI Advisor",
  },

  { divider: "Companies" },

  {
    href: "/companies",
    icon: Building2,
    label: "Companies",
  },

  {
    href: "/companies/compare",
    icon: TrendingUp,
    label: "Compare",
  },

  {
    href: "/companies/gaps",
    icon: BarChart2,
    label: "Skill Gaps",
  },

  { divider: "Preparation" },

  {
    href: "/leetcode",
    icon: Code2,
    label: "LeetCode",
  },

  {
    href: "/exam",
    icon: BookOpen,
    label: "Exam",
  },

  {
    href: "/chat",
    icon: MessageSquare,
    label: "AI Chat",
  },

  {
    href: "/resume",
    icon: FileText,
    label: "Resume",
  },

  {
    href: "/interview",
    icon: Mic,
    label: "Interview",
  },

  {
    href: "/progress",
    icon: TrendingUp,
    label: "Progress",
  },

  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const { user, setUser } =
    useStore();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[290px] flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <Link
          href="/dashboard"
          className="block"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
              <Sparkles
                size={22}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                PrepTrack
              </h1>

              <p className="text-xs text-slate-400">
                AI Placement Platform
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-1">
          {NAV.map((item, i) => {
            if ("divider" in item) {
              return (
                <div
                  key={i}
                  className="px-3 pb-2 pt-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {item.divider}
                  </p>
                </div>
              );
            }

            const Icon =
              item.icon;

            const active =
              pathname ===
                item.href ||
              pathname.startsWith(
                item.href + "/"
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "border border-purple-500/20 bg-gradient-to-r from-purple-500/15 to-blue-500/10 text-white shadow-lg shadow-purple-500/5"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                      : "bg-slate-900 text-slate-400 group-hover:bg-slate-800 group-hover:text-white"
                  )}
                >
                  <Icon size={18} />
                </div>

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-black text-white">
            {user
              ? getInitials(
                  user.username
                )
              : "?"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.username ??
                "Guest"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.email ?? ""}
            </p>
          </div>

          <button
            onClick={() => {
              setUser(null, null);

              window.location.href =
                "/login";
            }}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}