"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";

import { useStore } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, token } =
    useStore();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    const savedStore =
      localStorage.getItem(
        "preptrack-store"
      );

    let savedToken = null;

    let savedUser = null;

    try {
      if (savedStore) {
        const parsed =
          JSON.parse(savedStore);

        savedToken =
          parsed?.state?.token;

        savedUser =
          parsed?.state?.user;
      }
    } catch {
      savedToken = null;
      savedUser = null;
    }

    const isLoggedIn =
      Boolean(token || savedToken) &&
      Boolean(user || savedUser);

    if (!isLoggedIn) {
      router.replace("/login");

      return;
    }

    setCheckingAuth(false);
  }, [router, user, token]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-10 text-center backdrop-blur-xl">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500" />

          <p className="text-lg font-semibold text-white">
            Checking session...
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Preparing your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="relative ml-[290px] min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}