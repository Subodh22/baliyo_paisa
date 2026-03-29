"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CATEGORY_GROUPS, getExpenseCategoriesByGroup } from "@/lib/categories";
import {
  formatAUD, formatAUDShort, currentYearMonth,
  dollarsToCents, centsToDollars,
  toMonthlyCents, FREQUENCIES,
  type Frequency,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";

interface RowDraft {
  budgetAmount?: string;
  budgetFreq?: Frequency;
  actualAmount?: string;
  actualFreq?: Frequency;
}

export default function BudgetPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  const budgets = useQuery(api.budgets.listForMonth, { yearMonth });
  const expenseBreakdown = useQuery(api.transactions.categoryBreakdown, { yearMonth, type: "expense" });
  const upsertBudget = useMutation(api.budgets.upsert);
  const upsertActual = useMutation(api.budgets.upsertActual);

  // Saved maps
  const savedMap = useMemo(() => {
    const m: Record<string, { monthlyLimit: number; budgetAmount?: number; budgetFrequency?: Frequency; actualOverride?: number; actualFrequency?: Frequency }> = {};
    for (const b of budgets ?? []) m[b.category] = b as typeof m[string];
    return m;
  }, [budgets]);

  const txActualMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const item of expenseBreakdown ?? []) m[item.category] = item.amount;
    return m;
  }, [expenseBreakdown]);

  // ── Resolved values ──────────────────────────────────────────────────────

  function getSavedBudgetFreq(catId: string): Frequency {
    return (savedMap[catId]?.budgetFrequency as Frequency) ?? "monthly";
  }
  function getSavedActualFreq(catId: string): Frequency {
    return (savedMap[catId]?.actualFrequency as Frequency) ?? "monthly";
  }

  function getBudgetFreq(catId: string): Frequency {
    return drafts[catId]?.budgetFreq ?? getSavedBudgetFreq(catId);
  }
  function getActualFreq(catId: string): Frequency {
    return drafts[catId]?.actualFreq ?? getSavedActualFreq(catId);
  }

  /** Raw entered budget amount in dollars (at selected frequency) */
  function getBudgetAmount(catId: string): string {
    if (drafts[catId]?.budgetAmount !== undefined) return drafts[catId].budgetAmount!;
    const saved = savedMap[catId];
    if (!saved) return "";
    // Show stored raw amount if available, else back-convert from monthly
    const raw = saved.budgetAmount ?? 0;
    return raw > 0 ? String(centsToDollars(raw)) : "";
  }

  /** Raw entered actual amount in dollars (at selected frequency) */
  function getActualAmount(catId: string): string {
    if (drafts[catId]?.actualAmount !== undefined) return drafts[catId].actualAmount!;
    const saved = savedMap[catId];
    if (saved?.actualOverride !== undefined) {
      return String(centsToDollars(saved.actualOverride));
    }
    const tx = txActualMap[catId];
    return tx ? String(centsToDollars(tx)) : "";
  }

  /** Monthly-equivalent budget in cents (for totals/variance) */
  function getMonthlyBudget(catId: string): number {
    const amt = getBudgetAmount(catId);
    if (!amt || parseFloat(amt) === 0) return 0;
    return toMonthlyCents(dollarsToCents(parseFloat(amt)), getBudgetFreq(catId));
  }

  /** Monthly-equivalent actual in cents */
  function getMonthlyActual(catId: string): number {
    const amt = getActualAmount(catId);
    if (!amt || parseFloat(amt) === 0) return 0;
    return toMonthlyCents(dollarsToCents(parseFloat(amt)), getActualFreq(catId));
  }

  // ── Dirty detection ──────────────────────────────────────────────────────

  function isBudgetDirty(catId: string): boolean {
    const d = drafts[catId];
    if (!d) return false;
    if (d.budgetFreq !== undefined && d.budgetFreq !== getSavedBudgetFreq(catId)) return true;
    if (d.budgetAmount !== undefined) {
      const saved = savedMap[catId]?.budgetAmount ?? 0;
      return dollarsToCents(parseFloat(d.budgetAmount) || 0) !== saved;
    }
    return false;
  }

  function isActualDirty(catId: string): boolean {
    const d = drafts[catId];
    if (!d) return false;
    if (d.actualFreq !== undefined && d.actualFreq !== getSavedActualFreq(catId)) return true;
    if (d.actualAmount !== undefined) {
      const saved = savedMap[catId]?.actualOverride ?? txActualMap[catId] ?? 0;
      return dollarsToCents(parseFloat(d.actualAmount) || 0) !== saved;
    }
    return false;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  function patchDraft(catId: string, patch: Partial<RowDraft>) {
    setDrafts((p) => ({ ...p, [catId]: { ...p[catId], ...patch } }));
  }

  function discardRow(catId: string) {
    setDrafts((p) => { const n = { ...p }; delete n[catId]; return n; });
  }

  async function saveRow(catId: string) {
    const budgetDirty = isBudgetDirty(catId);
    const actualDirty = isActualDirty(catId);

    if (budgetDirty) {
      const amtStr = getBudgetAmount(catId);
      const freq = getBudgetFreq(catId);
      const rawCents = dollarsToCents(parseFloat(amtStr) || 0);
      const monthlyCents = toMonthlyCents(rawCents, freq);
      await upsertBudget({
        category: catId,
        monthlyLimit: monthlyCents,
        budgetAmount: rawCents,
        budgetFrequency: freq,
        yearMonth,
      });
    }
    if (actualDirty) {
      const amtStr = getActualAmount(catId);
      const freq = getActualFreq(catId);
      const rawCents = dollarsToCents(parseFloat(amtStr) || 0);
      const monthlyCents = toMonthlyCents(rawCents, freq);
      await upsertActual({
        category: catId,
        actualOverride: monthlyCents,
        actualFrequency: freq,
        yearMonth,
      });
    }
    discardRow(catId);
  }

  function handleKeyDown(e: React.KeyboardEvent, catId: string) {
    if (e.key === "Enter") saveRow(catId);
    if (e.key === "Escape") discardRow(catId);
  }

  // ── Grouped totals ────────────────────────────────────────────────────────

  const byGroup = useMemo(() => getExpenseCategoriesByGroup(), []);

  const grouped = useMemo(() => {
    return CATEGORY_GROUPS.map((g) => {
      const cats = byGroup[g.id] ?? [];
      const totalBudget = cats.reduce((s, c) => s + getMonthlyBudget(c.id), 0);
      const totalActual = cats.reduce((s, c) => s + getMonthlyActual(c.id), 0);
      return { ...g, cats, totalBudget, totalActual };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byGroup, savedMap, txActualMap, drafts]);

  const totalBudget = grouped.reduce((s, g) => s + g.totalBudget, 0);
  const totalActual = grouped.reduce((s, g) => s + g.totalActual, 0);
  const surplus = totalBudget - totalActual;

  // ── Shared styles ────────────────────────────────────────────────────────

  function inputCls(hasVal: boolean, dirty: boolean) {
    return cn(
      "w-24 rounded px-2 py-1 text-sm font-mono text-right transition-colors focus:outline-none",
      dirty
        ? "bg-surface border border-gold text-ink"
        : hasVal
        ? "bg-surface-alt border border-border text-ink"
        : "bg-transparent border border-transparent text-mid hover:border-border focus:border-gold focus:bg-surface-alt focus:text-ink"
    );
  }

  function freqCls(hasVal: boolean, dirty: boolean) {
    return cn(
      "rounded px-1.5 py-1 text-xs font-mono transition-colors focus:outline-none appearance-none cursor-pointer",
      dirty
        ? "bg-surface border border-gold text-gold"
        : hasVal
        ? "bg-surface-alt border border-border text-mid"
        : "bg-transparent border border-transparent text-dim hover:border-border hover:text-mid focus:border-gold focus:bg-surface-alt focus:text-mid"
    );
  }

  return (
    <div className="p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xs text-mid uppercase tracking-widest">Budget Planner</h2>
          <p className="text-xs text-mid mt-0.5">Set frequency + amount — Enter to save, Esc to discard</p>
        </div>
        <input
          type="month"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
          className="bg-surface-alt border border-border rounded px-3 py-1.5 text-ink text-xs font-mono focus:border-gold focus:outline-none"
        />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded p-4">
          <p className="text-2xs text-mid uppercase tracking-widest mb-1">Total Budget</p>
          <p className="text-2xl font-mono text-ink">{formatAUDShort(totalBudget)}</p>
          <p className="text-2xs text-mid mt-1">per month</p>
        </div>
        <div className="bg-surface border border-border rounded p-4">
          <p className="text-2xs text-mid uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-2xl font-mono text-ink">{formatAUDShort(totalActual)}</p>
          <p className="text-2xs text-mid mt-1">per month</p>
        </div>
        <div
          className="bg-surface border border-border border-l-2 rounded p-4"
          style={{ borderLeftColor: surplus >= 0 ? "#4ADE80" : "#F87171" }}
        >
          <p className="text-2xs text-mid uppercase tracking-widest mb-1">
            {surplus >= 0 ? "Surplus" : "Deficit"}
          </p>
          <p className={cn("text-2xl font-mono", surplus >= 0 ? "text-green-muted" : "text-red-muted")}>
            {surplus >= 0 ? "+" : ""}{formatAUDShort(surplus)}
          </p>
          {surplus >= 0 && totalBudget > 0 && (
            <p className="text-2xs text-mid mt-1">Budget is in surplus.</p>
          )}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-2">
        {grouped.map((group) => {
          const isCollapsed = collapsed[group.id];
          const groupOver = group.totalActual > group.totalBudget && group.totalBudget > 0;
          const groupPct = group.totalBudget > 0
            ? Math.min(100, (group.totalActual / group.totalBudget) * 100)
            : group.totalActual > 0 ? 100 : 0;

          return (
            <div key={group.id} className="bg-surface border border-border rounded overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => setCollapsed((p) => ({ ...p, [group.id]: !p[group.id] }))}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-alt transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                <span className="flex-1 text-sm font-medium text-ink">{group.label}</span>
                <span className="text-xs font-mono text-mid">
                  Budget: <span className="text-ink">{formatAUD(group.totalBudget)}</span>
                  <span className="text-dim">/mo</span>
                </span>
                <span className={cn("text-xs font-mono ml-6", groupOver ? "text-red-muted" : "text-mid")}>
                  Actual: <span className={groupOver ? "text-red-muted" : "text-ink"}>{formatAUD(group.totalActual)}</span>
                  <span className="text-dim">/mo</span>
                </span>
                {isCollapsed
                  ? <ChevronRight size={14} className="text-mid ml-4 flex-shrink-0" />
                  : <ChevronDown size={14} className="text-mid ml-4 flex-shrink-0" />}
              </button>

              {/* Group progress */}
              {!isCollapsed && group.totalBudget > 0 && (
                <div className="px-5 pb-1 -mt-1">
                  <div className="h-px bg-border rounded overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-500", groupOver ? "bg-red-muted" : "bg-gold")}
                      style={{ width: `${groupPct}%`, opacity: 0.6 }}
                    />
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <>
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_260px_260px_120px_52px] gap-2 px-5 py-2 border-t border-border">
                    <span className="text-2xs text-mid uppercase tracking-widest">Category</span>
                    <span className="text-2xs text-mid uppercase tracking-widest text-right">Budget</span>
                    <span className="text-2xs text-mid uppercase tracking-widest text-right">Actual</span>
                    <span className="text-2xs text-mid uppercase tracking-widest text-right">Variance/mo</span>
                    <span />
                  </div>

                  {/* Rows */}
                  {group.cats.map((cat) => {
                    const budgetAmt = getBudgetAmount(cat.id);
                    const actualAmt = getActualAmount(cat.id);
                    const budgetFreq = getBudgetFreq(cat.id);
                    const actualFreq = getActualFreq(cat.id);
                    const monthlyBudget = getMonthlyBudget(cat.id);
                    const monthlyActual = getMonthlyActual(cat.id);
                    const variance = monthlyBudget - monthlyActual;
                    const over = monthlyActual > monthlyBudget && monthlyBudget > 0;
                    const budgetDirty = isBudgetDirty(cat.id);
                    const actualDirty = isActualDirty(cat.id);
                    const anyDirty = budgetDirty || actualDirty;
                    const budgetHasVal = !!budgetAmt && parseFloat(budgetAmt) > 0;
                    const actualHasVal = !!actualAmt && parseFloat(actualAmt) > 0;
                    const rowActive = budgetHasVal || actualHasVal;
                    const pct = monthlyBudget > 0
                      ? Math.min(100, (monthlyActual / monthlyBudget) * 100)
                      : monthlyActual > 0 ? 100 : 0;

                    return (
                      <div key={cat.id} className="border-t border-border">
                        <div className="grid grid-cols-[1fr_260px_260px_120px_52px] gap-2 px-5 py-2.5 items-center hover:bg-surface-alt transition-colors">
                          {/* Label */}
                          <span className={cn("text-sm", rowActive ? "text-ink" : "text-mid")}>
                            {cat.label}
                          </span>

                          {/* Budget: frequency + amount */}
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={budgetFreq}
                              onChange={(e) => patchDraft(cat.id, { budgetFreq: e.target.value as Frequency })}
                              className={freqCls(budgetHasVal, budgetDirty)}
                            >
                              {FREQUENCIES.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </select>
                            <span className="text-xs text-mid font-mono">$</span>
                            <input
                              type="number"
                              value={budgetAmt}
                              onChange={(e) => patchDraft(cat.id, { budgetAmount: e.target.value })}
                              onKeyDown={(e) => handleKeyDown(e, cat.id)}
                              placeholder="0"
                              min="0"
                              step="10"
                              className={inputCls(budgetHasVal, budgetDirty)}
                            />
                          </div>

                          {/* Actual: frequency + amount */}
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={actualFreq}
                              onChange={(e) => patchDraft(cat.id, { actualFreq: e.target.value as Frequency })}
                              className={freqCls(actualHasVal, actualDirty)}
                            >
                              {FREQUENCIES.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))}
                            </select>
                            <span className="text-xs text-mid font-mono">$</span>
                            <input
                              type="number"
                              value={actualAmt}
                              onChange={(e) => patchDraft(cat.id, { actualAmount: e.target.value })}
                              onKeyDown={(e) => handleKeyDown(e, cat.id)}
                              placeholder="0"
                              min="0"
                              step="10"
                              className={cn(
                                inputCls(actualHasVal, actualDirty),
                                over && !actualDirty ? "!text-red-muted" : ""
                              )}
                            />
                          </div>

                          {/* Variance (monthly equiv) */}
                          <span className={cn(
                            "text-sm font-mono text-right",
                            !monthlyBudget && !monthlyActual ? "text-mid" :
                            variance >= 0 ? "text-green-muted" : "text-red-muted"
                          )}>
                            {monthlyBudget > 0 || monthlyActual > 0
                              ? `${variance >= 0 ? "+" : ""}${formatAUD(variance)}`
                              : "—"}
                          </span>

                          {/* Save / discard */}
                          <div className="flex items-center justify-end gap-1">
                            {anyDirty && (
                              <>
                                <button
                                  onClick={() => saveRow(cat.id)}
                                  className="text-green-muted hover:opacity-70 p-0.5"
                                  title="Save (Enter)"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => discardRow(cat.id)}
                                  className="text-mid hover:text-ink p-0.5"
                                  title="Discard (Esc)"
                                >
                                  <X size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Row progress */}
                        {(monthlyBudget > 0 || monthlyActual > 0) && (
                          <div className="px-5 pb-1">
                            <div className="h-px bg-border rounded overflow-hidden">
                              <div
                                className={cn("h-full transition-all duration-300", over ? "bg-red-muted" : "bg-gold")}
                                style={{ width: `${pct}%`, opacity: 0.4 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
