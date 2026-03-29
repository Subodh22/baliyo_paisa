"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartWrapper, axisProps, gridProps, tooltipStyle } from "./ChartWrapper";
import { formatAUDShort, formatYearMonth } from "@/lib/format";

interface DataPoint {
  yearMonth: string;
  income: number;
  expenses: number;
}

export function CashFlowChart({ data }: { data: DataPoint[] }) {
  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-sm text-mid">
      No transaction data yet.
    </div>
  );

  const formatted = data.map((d) => ({
    label: formatYearMonth(d.yearMonth),
    income: d.income / 100,
    expenses: d.expenses / 100,
    net: (d.income - d.expenses) / 100,
  }));

  return (
    <ChartWrapper height={220}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barGap={4}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => formatAUDShort(v * 100)} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown, name: string) => [
            formatAUDShort((value as number) * 100),
            name === "income" ? "Income" : "Expenses",
          ]}
        />
        <Bar dataKey="income" fill="#C9A84C" fillOpacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expenses" fill="#F2EEE8" fillOpacity={0.35} radius={[2, 2, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ChartWrapper>
  );
}
