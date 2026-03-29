"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_GROUPS, getExpenseCategoriesByGroup } from "@/lib/categories";
import { today, dollarsToCents, centsToDollars } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  editItem?: {
    _id: Id<"transactions">;
    type: "income" | "expense";
    amount: number;
    date: string;
    description: string;
    category: string;
    notes?: string;
    isRecurring: boolean;
  } | null;
}

export function TransactionModal({ open, onClose, editItem }: TransactionModalProps) {
  const addTxn = useMutation(api.transactions.add);
  const updateTxn = useMutation(api.transactions.update);
  const removeTxn = useMutation(api.transactions.remove);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(String(centsToDollars(editItem.amount)));
      setDate(editItem.date);
      setDescription(editItem.description);
      setCategory(editItem.category);
      setNotes(editItem.notes ?? "");
      setIsRecurring(editItem.isRecurring);
    } else {
      setType("expense");
      setAmount("");
      setDate(today());
      setDescription("");
      setCategory("");
      setNotes("");
      setIsRecurring(false);
    }
  }, [editItem, open]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !category) return;
    setLoading(true);
    try {
      const cents = dollarsToCents(parseFloat(amount));
      if (editItem) {
        await updateTxn({
          id: editItem._id,
          amount: cents,
          date,
          description,
          category,
          notes: notes || undefined,
          isRecurring,
        });
      } else {
        await addTxn({
          type,
          amount: cents,
          date,
          description,
          category,
          notes: notes || undefined,
          isRecurring,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!editItem) return;
    setLoading(true);
    try {
      await removeTxn({ id: editItem._id });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-bg/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-96 bg-surface border-l border-border flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-sm font-medium text-ink">
            {editItem ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="text-mid hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Type toggle */}
          {!editItem && (
            <div>
              <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
                Type
              </label>
              <div className="flex border border-border rounded overflow-hidden">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setCategory(""); }}
                    className={cn(
                      "flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
                      type === t
                        ? t === "income"
                          ? "bg-green-muted/10 text-green-muted"
                          : "bg-red-muted/10 text-red-muted"
                        : "text-mid hover:text-ink"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
              Amount (AUD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mid font-mono text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded pl-7 pr-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none"
              placeholder="e.g. Woolworths groceries"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none"
              required
            >
              <option value="">Select category</option>
              {type === "expense" ? (
                // Grouped by budget planner sections
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
              ) : (
                INCOME_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))
              )}
            </select>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="accent-gold"
            />
            <label htmlFor="recurring" className="text-sm text-mid cursor-pointer">
              Recurring transaction
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none resize-none"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          {editItem && (
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit as any} disabled={loading}>
            {loading ? "Saving…" : editItem ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
