"use client";

import { ResponsiveContainer } from "recharts";
import { ReactNode } from "react";

interface ChartWrapperProps {
  height?: number;
  children: ReactNode;
}

export function ChartWrapper({ height = 240, children }: ChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children as React.ReactElement}
    </ResponsiveContainer>
  );
}

// Shared axis/grid styles for Recharts
export const chartColors = {
  grid: "#1F1F23",
  axis: "#6B6760",
  gold: "#C9A84C",
  ink: "#F2EEE8",
  mid: "#6B6760",
  green: "#4ADE80",
  red: "#F87171",
};

export const axisProps = {
  tick: { fill: chartColors.axis, fontSize: 11, fontFamily: "JetBrains Mono, monospace" },
  axisLine: { stroke: chartColors.grid },
  tickLine: false as const,
};

export const gridProps = {
  strokeDasharray: "0",
  stroke: chartColors.grid,
  vertical: false,
};

export const tooltipStyle = {
  contentStyle: {
    background: "#111113",
    border: "1px solid #1F1F23",
    borderRadius: 4,
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
    color: "#F2EEE8",
  },
  itemStyle: { color: "#F2EEE8" },
  labelStyle: { color: "#6B6760", marginBottom: 4 },
};
