"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { formatAUD, formatDate, currentYearMonth } from "@/lib/format";
import { INCOME_CATEGORIES, CATEGORY_GROUPS, getExpenseCategoriesByGroup } from "@/lib/categories";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type TxType = "all" | "income" | "expense";

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TxType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState(currentYearMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Doc<"transactions"> | null>(null);

  const rawTxns = useQuery(api.transactions.list, {
    type: typeFilter === "all" ? undefined : typeFilter,
    yearMonth: monthFilter || undefined,
  });

  const transactions = useMemo(() => {
    if (!rawTxns) return [];
    return rawTxns.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rawTxns, categoryFilter, search]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpenses;


  return (
    <div className="p-8">
      <SectionHeader
        title="Transactions"
        subtitle="All income and expenses"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            <Plus size={14} /> Add
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type toggle */}
        <div className="flex border border-border rounded overflow-hidden text-xs">
          {(["all", "income", "expense"] as TxType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setCategoryFilter(""); }}
              className={cn(
                "px-3 py-1.5 font-mono uppercase tracking-wider transition-colors capitalize",
                typeFilter === t ? "bg-surface-alt text-ink" : "text-mid hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Month picker */}
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-surface-alt border border-border rounded px-3 py-1.5 text-ink text-xs font-mono focus:border-gold focus:outline-none"
        />

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-surface-alt border border-border rounded px-3 py-1.5 text-ink text-xs focus:border-gold focus:outline-none"
        >
          <option value="">All categories</option>
          {typeFilter !== "income" && (
            Object.entries(getExpenseCategoriesByGroup()).map(([groupId, cats]) => {
              const groupLabel = CATEGORY_GROUPS.find((g) => g.id === groupId)?.label ?? groupId;
              return (
                <optgroup key={groupId} label={groupLabel}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </optgroup>
              );
            })
          )}
          {typeFilter !== "expense" && (
            <optgroup label="Income">
              {INCOME_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-surface-alt border border-border rounded pl-8 pr-3 py-1.5 text-ink text-xs focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                <th
                  key={h}
                  className="text-left text-2xs text-mid uppercase tracking-widest px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rawTxns ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-mid">
                  Loading…
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-mid">
                  No transactions found.{" "}
                  <button
                    onClick={() => { setEditItem(null); setModalOpen(true); }}
                    className="text-gold underline underline-offset-2"
                  >
                    Add one
                  </button>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => { setEditItem(t); setModalOpen(true); }}
                  className="border-b border-border last:border-0 hover:bg-surface-alt cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-mid whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink max-w-xs truncate">
                    {t.description}
                    {t.isRecurring && (
                      <span className="ml-2 text-2xs text-mid font-mono">↻</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge category={t.category} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.type} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "font-mono text-sm",
                        t.type === "income" ? "text-green-muted" : "text-ink"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatAUD(t.amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Summary footer */}
        {transactions.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex gap-6 bg-surface-alt">
            <span className="text-xs text-mid">
              Income:{" "}
              <span className="font-mono text-green-muted">{formatAUD(totalIncome)}</span>
            </span>
            <span className="text-xs text-mid">
              Expenses:{" "}
              <span className="font-mono text-ink">{formatAUD(totalExpenses)}</span>
            </span>
            <span className="text-xs text-mid">
              Net:{" "}
              <span className={cn("font-mono", net >= 0 ? "text-green-muted" : "text-red-muted")}>
                {net >= 0 ? "+" : ""}{formatAUD(net)}
              </span>
            </span>
            <span className="text-xs text-mid ml-auto font-mono">
              {transactions.length} transactions
            </span>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editItem={editItem}
      />
    </div>
  );
}
