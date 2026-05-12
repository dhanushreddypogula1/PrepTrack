"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: number;
  color?: "violet" | "blue" | "emerald" | "amber" | "rose";
  className?: string;
}

const colorMap = {
  violet: "text-violet-400 bg-violet-400/10",
  blue:   "text-blue-400 bg-blue-400/10",
  emerald:"text-emerald-400 bg-emerald-400/10",
  amber:  "text-amber-400 bg-amber-400/10",
  rose:   "text-rose-400 bg-rose-400/10",
};

export function StatCard({ title, value, sub, icon: Icon, trend, color = "violet", className }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("stat-card", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        {Icon && (
          <span className={cn("p-1.5 rounded-lg", colorMap[color])}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={cn("text-xs font-medium", trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
      )}
    </motion.div>
  );
}
