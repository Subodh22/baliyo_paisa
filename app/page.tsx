"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFireCalc } from "@/hooks/useFireCalc";
import { useNetWorth } from "@/hooks/useNetWorth";
import { useCashFlow } from "@/hooks/useCashFlow";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { formatAUDShort, formatAUD, formatDate, formatPct } from "@/lib/format";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const calc = useFireCalc();
  const nw = useNetWorth();
  const { summary, last12 } = useCashFlow();
  const recentTxns = useQuery(api.transactions.recentTransactions, { limit: 8 });

  const income = summary?.income ?? 0;
  const expenses = summary?.expenses ?? 0;
  const net = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

  const prevSnapshot = nw.snapshots[nw.snapshots.length - 2];
  const netWorthTrend =
    prevSnapshot && prevSnapshot.netWorth !== 0
      ? ((nw.netWorth - prevSnapshot.netWorth) / Math.abs(prevSnapshot.netWorth)) * 100
      : undefined;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-mono font-medium text-ink">Overview</h1>
        <p className="text-sm text-mid mt-1">
          {new Date().toLocaleDateString("en-AU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Net Worth"
          value={formatAUDShort(nw.netWorth)}
          trend={netWorthTrend}
          accent
        />
        <StatCard
          label="Savings Rate"
          value={formatPct(savingsRate)}
          subtext="This month"
        />
        <StatCard
          label="FIRE Progress"
          value={calc ? `${calc.pctToFire.toFixed(1)}%` : "—"}
          subtext={calc ? `of ${formatAUDShort(calc.fireTarget)}` : "Set up FIRE settings"}
        />
        <StatCard
          label="Time to FIRE"
          value={
            calc
              ? calc.yearsToFire === Infinity
                ? "∞"
                : calc.yearsToFire === 0
                ? "Now!"
                : `${Math.floor(calc.yearsToFire)}y`
              : "—"
          }
          subtext={
            calc?.projectedRetirementAge
              ? `Retire at ${calc.projectedRetirementAge}`
              : undefined
          }
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Cash Flow chart + Recent transactions */}
        <div className="col-span-2 space-y-6">
          {/* 12-month cash flow */}
          <div className="bg-surface border border-border rounded p-5">
            <SectionHeader
              title="Cash Flow"
              subtitle="Last 12 months"
              action={
                <Link
                  href="/cashflow"
                  className="text-2xs text-gold hover:underline uppercase tracking-widest"
                >
                  View all →
                </Link>
              }
            />
            <CashFlowChart data={last12 ?? []} />
          </div>

          {/* Recent transactions */}
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <SectionHeader
                title="Recent Transactions"
                action={
                  <Link
                    href="/transactions"
                    className="text-2xs text-gold hover:underline uppercase tracking-widest"
                  >
                    View all →
                  </Link>
                }
              />
            </div>
            {!recentTxns || recentTxns.length === 0 ? (
              <div className="px-5 pb-5 text-sm text-mid">
                No transactions yet.{" "}
                <Link
                  href="/transactions"
                  className="text-gold underline underline-offset-2"
                >
                  Add your first
                </Link>
              </div>
            ) : (
              recentTxns.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-4 px-5 py-3 border-t border-border hover:bg-surface-alt transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xs text-mid font-mono">
                        {formatDate(t.date)}
                      </span>
                      <Badge category={t.category} />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-mono flex-shrink-0",
                      t.type === "income" ? "text-green-muted" : "text-ink"
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatAUD(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* FIRE progress ring */}
          <div className="bg-surface border border-border rounded p-5">
            <p className="text-2xs text-mid uppercase tracking-widest mb-4">FIRE Progress</p>
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1F1F23" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#C9A84C"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - (calc?.pctToFire ?? 0) / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-mono text-gold">
                    {calc ? `${calc.pctToFire.toFixed(0)}%` : "—"}
                  </span>
                  <span className="text-2xs text-mid">to FIRE</span>
                </div>
              </div>
              {calc && (
                <div className="w-full space-y-2 text-center">
                  <p className="text-xs text-mid">
                    Target:{" "}
                    <span className="font-mono text-ink">
                      {formatAUDShort(calc.fireTarget)}
                    </span>
                  </p>
                  <p className="text-xs text-mid">
                    Portfolio:{" "}
                    <span className="font-mono text-ink">
                      {formatAUDShort(calc.portfolioForCalc)}
                    </span>
                  </p>
                  {calc.isCoastFire && (
                    <span className="inline-block text-2xs font-mono text-gold bg-gold-dim px-2 py-0.5 rounded">
                      Coast FIRE ✓
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* This month snapshot */}
          <div className="bg-surface border border-border rounded p-5">
            <p className="text-2xs text-mid uppercase tracking-widest mb-4">This Month</p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-mid">Income</span>
                <span className="text-xs font-mono text-green-muted">
                  {formatAUD(income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-mid">Expenses</span>
                <span className="text-xs font-mono text-ink">{formatAUD(expenses)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-xs text-mid">Net</span>
                <span
                  className={cn(
                    "text-xs font-mono",
                    net >= 0 ? "text-green-muted" : "text-red-muted"
                  )}
                >
                  {net >= 0 ? "+" : ""}
                  {formatAUD(net)}
                </span>
              </div>
              <div className="pt-1">
                <div className="flex justify-between mb-1.5">
                  <span className="text-2xs text-mid">Savings rate</span>
                  <span className="text-2xs font-mono text-mid">
                    {formatPct(savingsRate)}
                  </span>
                </div>
                <ProgressBar value={savingsRate} thick />
              </div>
            </div>
          </div>

          {/* Net worth quick view */}
          <div className="bg-surface border border-border rounded p-5">
            <SectionHeader
              title="Net Worth"
              action={
                <Link
                  href="/networth"
                  className="text-2xs text-gold hover:underline uppercase tracking-widest"
                >
                  Details →
                </Link>
              }
            />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-mid">Assets</span>
                <span className="text-xs font-mono text-ink">
                  {formatAUDShort(nw.totalAssets)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-mid">Liabilities</span>
                <span className="text-xs font-mono text-red-muted">
                  {formatAUDShort(nw.totalLiabilities)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-xs text-mid">Net Worth</span>
                <span className="text-xs font-mono text-gold">
                  {formatAUDShort(nw.netWorth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
