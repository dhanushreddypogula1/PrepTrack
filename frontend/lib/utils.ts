import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(
  ...inputs: ClassValue[]
) {
  return twMerge(clsx(inputs));
}

export function getInitials(
  name?: string
) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function fmtPct(n?: number) {
  if (n == null) return "0%";

  return `${Math.round(n)}%`;
}

export function fmtCTC(n?: number) {
  if (n == null) return "₹0 LPA";

  return `₹${n.toFixed(1)} LPA`;
}

export const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "AIML",
  "DS",
];

export const TIER_COLORS: Record<
  string,
  string
> = {
  Tier1:
    "border-purple-500/20 bg-purple-500/10 text-purple-300",
  Tier2:
    "border-blue-500/20 bg-blue-500/10 text-blue-300",
  Tier3:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

export const ELIGIBILITY_COLORS: Record<
  string,
  string
> = {
  eligible: "text-emerald-400",
  stretch: "text-amber-400",
  not_eligible: "text-rose-400",
};