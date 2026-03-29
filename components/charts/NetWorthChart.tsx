"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartWrapper, axisProps, gridProps, tooltipStyle } from "./ChartWrapper";
import { formatAUDShort, formatYearMonth } from "@/lib/format";

interface DataPoint {
  yearMonth: string;
  netWorth: number;
  investableAssets: number;
}

export function NetWorthChart({ data }: { data: DataPoint[] }) {
  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-sm text-mid">
      No snapshot data yet. Click "Take Snapshot" to record your first data point.
    </div>
  );

  const formatted = data.map((d) => ({
    ...d,
    label: formatYearMonth(d.yearMonth),
    netWorthDisplay: d.netWorth / 100,
    investableDisplay: d.investableAssets / 100,
  }));

  return (
    <ChartWrapper height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis
          {...axisProps}
          tickFormatter={(v) => formatAUDShort(v * 100)}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown, name: string) => [
            formatAUDShort((value as number) * 100),
            name === "netWorthDisplay" ? "Net Worth" : "Investable",
          ]}
          labelFormatter={(l) => l}
        />
        <Line
          type="monotone"
          dataKey="netWorthDisplay"
          stroke="#C9A84C"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "#C9A84C" }}
        />
        <Line
          type="monotone"
          dataKey="investableDisplay"
          stroke="#6B6760"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ChartWrapper>
  );
}
