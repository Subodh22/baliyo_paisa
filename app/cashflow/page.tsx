"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { formatAUDShort, formatAUD, formatYearMonth, currentYearMonth } from "@/lib/format";
import { getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function daysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Monday=0 index for first day of month */
function firstDayOffset(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number);
  const dow = new Date(y, m - 1, 1).getDay(); // 0=Sun
  return (dow + 6) % 7; // convert to Mon=0
}

export default function CashFlowPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const txns = useQuery(api.transactions.list, { yearMonth });
  const last12 = useQuery(api.transactions.last12MonthsSummary);

  // ── Build per-day maps ────────────────────────────────────────────────────
  const dayMap = useMemo(() => {
    const map: Record<number, { income: number; expenses: number; items: typeof txns }> = {};
    const days = daysInMonth(yearMonth);
    for (let d = 1; d <= days; d++) map[d] = { income: 0, expenses: 0, items: [] };
    for (const t of txns ?? []) {
      const day = parseInt(t.date.slice(8, 10));
      if (!map[day]) continue;
      if (t.type === "income") map[day].income += t.amount;
      else map[day].expenses += t.amount;
      map[day].items = [...(map[day].items ?? []), t];
    }
    return map;
  }, [txns, yearMonth]);

  // ── Running balance (cumulative net across month) ─────────────────────────
  const runningBalance = useMemo(() => {
    const days = daysInMonth(yearMonth);
    const arr: number[] = new Array(days + 1).fill(0);
    for (let d = 1; d <= days; d++) {
      const net = (dayMap[d]?.income ?? 0) - (dayMap[d]?.expenses ?? 0);
      arr[d] = arr[d - 1] + net;
    }
    return arr;
  }, [dayMap, yearMonth]);

  // ── Month totals ──────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => Object.values(dayMap).reduce((s, d) => s + d.income, 0),
    [dayMap]
  );
  const totalExpenses = useMemo(
    () => Object.values(dayMap).reduce((s, d) => s + d.expenses, 0),
    [dayMap]
  );
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (net / totalIncome) * 100) : 0;

  // ── Selected day detail ───────────────────────────────────────────────────
  const selectedDayData = selectedDay ? dayMap[selectedDay] : null;

  // ── Calendar layout ───────────────────────────────────────────────────────
  const days = daysInMonth(yearMonth);
  const offset = firstDayOffset(yearMonth);
  const totalCells = offset + days;
  const rows = Math.ceil(totalCells / 7);

  const [todayY, todayM, todayD] = new Date().toISOString().slice(0, 10).split("-").map(Number);
  const isCurrentMonth = yearMonth === `${todayY}-${String(todayM).padStart(2, "0")}`;

  // max single-day spend for bar scaling
  const maxDaySpend = Math.max(...Object.values(dayMap).map((d) => d.expenses), 1);

  return (
    <div className="p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xs text-mid uppercase tracking-widest">Cash Flow</h2>
          <p className="text-xs text-mid mt-0.5">{formatYearMonth(yearMonth)} — daily income, expenses & running balance</p>
        </div>
        <input
          type="month"
          value={yearMonth}
          onChange={(e) => { setYearMonth(e.target.value); setSelectedDay(null); }}
          className="bg-surface-alt border border-border rounded px-3 py-1.5 text-ink text-xs font-mono focus:border-gold focus:outline-none"
        />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Income" value={formatAUDShort(totalIncome)} accent />
        <StatCard label="Expenses" value={formatAUDShort(totalExpenses)} />
        <StatCard
          label="Net Cash Flow"
          value={
            <span className={cn("font-mono", net >= 0 ? "text-green-muted" : "text-red-muted")}>
              {net >= 0 ? "+" : ""}{formatAUDShort(net)}
            </span>
          }
        />
        <StatCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          subtext={`End balance: ${net >= 0 ? "+" : ""}${formatAUDShort(net)}`}
        />
      </div>

      {/* ── Monthly Calendar ─────────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded overflow-hidden mb-6">
        {/* Legend */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-2xs text-mid uppercase tracking-widest">Monthly Calendar</p>
          <div className="flex items-center gap-4 text-xs text-mid">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-muted inline-block opacity-70" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-muted inline-block opacity-70" />
              Expense
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold inline-block opacity-70" />
              Running balance
            </span>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-2xs text-mid uppercase tracking-widest font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: rows * 7 }).map((_, idx) => {
            const day = idx - offset + 1;
            const valid = day >= 1 && day <= days;
            const isToday = isCurrentMonth && day === todayD;
            const data = valid ? dayMap[day] : null;
            const balance = valid ? runningBalance[day] : 0;
            const hasActivity = data && (data.income > 0 || data.expenses > 0);
            const isSelected = selectedDay === day && valid;
            const spendPct = data ? Math.min(100, (data.expenses / maxDaySpend) * 60) : 0;

            return (
              <div
                key={idx}
                onClick={() => valid && setSelectedDay(isSelected ? null : day)}
                className={cn(
                  "border-r border-b border-border min-h-[88px] p-2 transition-colors relative",
                  !valid && "bg-surface/40",
                  valid && "cursor-pointer",
                  isSelected && "bg-gold-dim border-gold",
                  valid && !isSelected && hasActivity && "hover:bg-surface-alt",
                  valid && !isSelected && !hasActivity && "hover:bg-surface-alt/50",
                  // Remove right border on last col, bottom border on last row
                  (idx + 1) % 7 === 0 && "border-r-0",
                  idx >= (rows - 1) * 7 && "border-b-0"
                )}
              >
                {valid && (
                  <>
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs font-mono font-medium w-5 h-5 flex items-center justify-center rounded",
                          isToday
                            ? "bg-gold text-bg text-2xs"
                            : hasActivity
                            ? "text-ink"
                            : "text-mid"
                        )}
                      >
                        {day}
                      </span>
                      {/* Balance dot */}
                      {balance !== 0 && (
                        <span
                          className={cn(
                            "text-2xs font-mono",
                            balance >= 0 ? "text-gold opacity-70" : "text-red-muted opacity-70"
                          )}
                        >
                          {balance >= 0 ? "+" : ""}{formatAUDShort(balance)}
                        </span>
                      )}
                    </div>

                    {/* Income bar */}
                    {data && data.income > 0 && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="w-1 h-1 rounded-full bg-green-muted flex-shrink-0 opacity-80" />
                        <span className="text-2xs font-mono text-green-muted truncate">
                          +{formatAUDShort(data.income)}
                        </span>
                      </div>
                    )}

                    {/* Expense bar */}
                    {data && data.expenses > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-red-muted flex-shrink-0 opacity-80" />
                          <span className="text-2xs font-mono text-red-muted truncate">
                            -{formatAUDShort(data.expenses)}
                          </span>
                        </div>
                        {/* Spend intensity bar */}
                        <div className="h-px bg-border rounded overflow-hidden mt-1">
                          <div
                            className="h-full bg-red-muted opacity-50 transition-all duration-300"
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected Day Detail ────────────────────────────────────────────── */}
      {selectedDay && selectedDayData && (
        <div className="bg-surface border border-gold/30 rounded p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-ink">
              {formatYearMonth(yearMonth).replace(/\s/, " ")} {selectedDay}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono">
              {selectedDayData.income > 0 && (
                <span className="text-green-muted">+{formatAUD(selectedDayData.income)}</span>
              )}
              {selectedDayData.expenses > 0 && (
                <span className="text-red-muted">-{formatAUD(selectedDayData.expenses)}</span>
              )}
              <span className={cn(
                "text-mid",
                (selectedDayData.income - selectedDayData.expenses) >= 0 ? "text-gold" : "text-red-muted"
              )}>
                Net: {(selectedDayData.income - selectedDayData.expenses) >= 0 ? "+" : ""}
                {formatAUD(selectedDayData.income - selectedDayData.expenses)}
              </span>
            </div>
          </div>

          {selectedDayData.items && selectedDayData.items.length > 0 ? (
            <div className="space-y-2">
              {(selectedDayData.items as { _id: string; type: string; description: string; category: string; amount: number }[]).map((t) => (
                <div key={t._id} className="flex items-center gap-3 py-2 border-t border-border first:border-t-0">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      t.type === "income" ? "bg-green-muted" : "bg-red-muted"
                    )}
                  />
                  <span className="flex-1 text-sm text-ink">{t.description}</span>
                  <span className="text-xs text-mid">{getCategoryLabel(t.category)}</span>
                  <span className={cn(
                    "text-sm font-mono",
                    t.type === "income" ? "text-green-muted" : "text-red-muted"
                  )}>
                    {t.type === "income" ? "+" : "-"}{formatAUD(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mid text-center py-4">No transactions on this day.</p>
          )}

          {/* Running balance context */}
          <div className="border-t border-border mt-4 pt-3 flex justify-between items-center">
            <span className="text-xs text-mid">Month-to-date balance after day {selectedDay}</span>
            <span className={cn(
              "text-sm font-mono",
              runningBalance[selectedDay] >= 0 ? "text-gold" : "text-red-muted"
            )}>
              {runningBalance[selectedDay] >= 0 ? "+" : ""}
              {formatAUD(runningBalance[selectedDay])}
            </span>
          </div>
        </div>
      )}

      {/* ── Running Balance Strip ─────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded p-5 mb-6">
        <p className="text-2xs text-mid uppercase tracking-widest mb-4">Running Balance — {formatYearMonth(yearMonth)}</p>
        <div className="flex items-end gap-px h-16">
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1;
            const bal = runningBalance[d];
            const maxAbs = Math.max(...runningBalance.slice(1, days + 1).map(Math.abs), 1);
            const pct = Math.abs(bal) / maxAbs;
            const isToday = isCurrentMonth && d === todayD;
            const isSelected = selectedDay === d;

            return (
              <div
                key={d}
                className="flex-1 flex flex-col items-center justify-end cursor-pointer group"
                onClick={() => setSelectedDay(isSelected ? null : d)}
                title={`Day ${d}: ${bal >= 0 ? "+" : ""}${formatAUD(bal)}`}
              >
                <div
                  className={cn(
                    "w-full rounded-sm transition-all duration-200",
                    bal >= 0 ? "bg-gold" : "bg-red-muted",
                    isSelected || isToday ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                  )}
                  style={{ height: `${Math.max(2, pct * 100)}%` }}
                />
                {(d === 1 || d % 5 === 0 || d === days) && (
                  <span className="text-2xs text-dim mt-1 font-mono">{d}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 12-Month chart ────────────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded p-5">
        <SectionHeader title="12-Month Overview" />
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-3 h-2.5 rounded-sm bg-gold/70 inline-block" /> Income
          </span>
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-3 h-2.5 rounded-sm bg-ink/35 inline-block" /> Expenses
          </span>
        </div>
        <CashFlowChart data={last12 ?? []} />
      </div>
    </div>
  );
}
