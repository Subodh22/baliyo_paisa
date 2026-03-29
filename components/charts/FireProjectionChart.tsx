"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChartWrapper, axisProps, gridProps, tooltipStyle } from "./ChartWrapper";
import { formatAUDShort } from "@/lib/format";
import type { ProjectionPoint } from "@/lib/fire";

export function FireProjectionChart({ data }: { data: ProjectionPoint[] }) {
  if (!data.length) return null;

  const formatted = data.map((p) => ({
    label: `Age ${p.age}`,
    portfolio: p.portfolioValue / 100,
    fireTarget: p.fireTarget / 100,
    coastTarget: p.coastFireTarget / 100,
  }));

  const fireValue = formatted[0]?.fireTarget ?? 0;

  return (
    <ChartWrapper height={240}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis
          {...axisProps}
          tickFormatter={(v) => formatAUDShort(v * 100)}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown, name: string) => [
            formatAUDShort((value as number) * 100),
            name === "portfolio" ? "Portfolio" : name === "fireTarget" ? "FIRE Target" : "Coast FIRE",
          ]}
        />
        <ReferenceLine
          y={fireValue}
          stroke="#C9A84C"
          strokeDasharray="6 3"
          strokeWidth={1}
          label={{ value: "FIRE", fill: "#C9A84C", fontSize: 10, position: "right" }}
        />
        <Area
          type="monotone"
          dataKey="portfolio"
          stroke="#C9A84C"
          strokeWidth={1.5}
          fill="url(#portfolioGrad)"
          dot={false}
          activeDot={{ r: 3, fill: "#C9A84C" }}
        />
      </AreaChart>
    </ChartWrapper>
  );
}
