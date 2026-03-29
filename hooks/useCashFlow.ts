"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { currentYearMonth } from "@/lib/format";

export function useCashFlow(yearMonth?: string) {
  const ym = yearMonth ?? currentYearMonth();
  const summary = useQuery(api.transactions.monthlySummary, { yearMonth: ym });
  const last12 = useQuery(api.transactions.last12MonthsSummary);

  return { summary, last12, yearMonth: ym };
}
