import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppStore } from "@/types";

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null, token: null, lastProfile: null, lastPrediction: null,
      setUser: (user, token) => set({ user, token }),
      setAssessment: (lastProfile, lastPrediction) => set({ lastProfile, lastPrediction }),
    }),
    { name: "preptrack-store" }
  )
);
