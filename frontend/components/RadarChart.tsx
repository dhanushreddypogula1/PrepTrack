"use client";
import { Radar, RadarChart as RC, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Props { data: { subject: string; value: number; fullMark?: number }[]; color?: string }

export function RadarChart({ data, color = "#7C3AED" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RC data={data}>
        <PolarGrid stroke="#2A2A3D" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#161625", border: "1px solid #2A2A3D", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#fff" }} />
        <Radar name="You" dataKey="value" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
      </RC>
    </ResponsiveContainer>
  );
}
