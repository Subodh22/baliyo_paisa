"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartWrapper, tooltipStyle } from "./ChartWrapper";
import { formatAUDShort } from "@/lib/format";
import { getCategoryColor, getCategoryLabel } from "@/lib/categories";

interface DataPoint {
  category: string;
  amount: number;
  pct: number;
}

export function ExpensePieChart({ data }: { data: DataPoint[] }) {
  if (!data.length) return (
    <div className="h-40 flex items-center justify-center text-sm text-mid">
      No expense data.
    </div>
  );

  const chartData = data.slice(0, 8).map((d) => ({
    name: getCategoryLabel(d.category),
    value: d.amount / 100,
    color: getCategoryColor(d.category),
    pct: d.pct,
  }));

  return (
    <ChartWrapper height={180}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Pie>
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown, name: string) => [formatAUDShort((value as number) * 100), name]}
        />
      </PieChart>
    </ChartWrapper>
  );
}
