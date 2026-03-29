"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { dollarsToCents, centsToDollars, today } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalMode = "asset" | "liability";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  mode: ModalMode;
  editAsset?: {
    _id: Id<"assets">;
    name: string;
    type: string;
    value: number;
    costBasis?: number;
    ticker?: string;
    units?: number;
    notes?: string;
  } | null;
  editLiability?: {
    _id: Id<"liabilities">;
    name: string;
    type: string;
    balance: number;
    originalBalance: number;
    interestRate: number;
    lender?: string;
    notes?: string;
    startDate: string;
  } | null;
}

const ASSET_TYPES = ["cash", "super", "etf", "shares", "property", "bonds", "crypto", "other"] as const;
const LIABILITY_TYPES = ["mortgage", "personal_loan", "car_loan", "credit_card", "hecs", "other"] as const;

export function AccountModal({ open, onClose, mode, editAsset, editLiability }: AccountModalProps) {
  const addAsset = useMutation(api.assets.add);
  const updateAsset = useMutation(api.assets.update);
  const removeAsset = useMutation(api.assets.remove);
  const addLiability = useMutation(api.liabilities.add);
  const updateLiability = useMutation(api.liabilities.update);
  const removeLiability = useMutation(api.liabilities.remove);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [ticker, setTicker] = useState("");
  const [units, setUnits] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [originalBalance, setOriginalBalance] = useState("");
  const [lender, setLender] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "asset" && editAsset) {
      setName(editAsset.name);
      setType(editAsset.type);
      setValue(String(centsToDollars(editAsset.value)));
      setCostBasis(editAsset.costBasis ? String(centsToDollars(editAsset.costBasis)) : "");
      setTicker(editAsset.ticker ?? "");
      setUnits(editAsset.units ? String(editAsset.units) : "");
      setNotes(editAsset.notes ?? "");
    } else if (mode === "liability" && editLiability) {
      setName(editLiability.name);
      setType(editLiability.type);
      setValue(String(centsToDollars(editLiability.balance)));
      setOriginalBalance(String(centsToDollars(editLiability.originalBalance)));
      setInterestRate(String(editLiability.interestRate));
      setLender(editLiability.lender ?? "");
      setStartDate(editLiability.startDate);
      setNotes(editLiability.notes ?? "");
    } else {
      setName(""); setType(""); setValue(""); setCostBasis(""); setTicker("");
      setUnits(""); setInterestRate(""); setOriginalBalance(""); setLender("");
      setStartDate(today()); setNotes("");
    }
  }, [editAsset, editLiability, mode, open]);

  const showInvestmentFields = ["etf", "shares"].includes(type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !type || !value) return;
    setLoading(true);
    try {
      if (mode === "asset") {
        const cents = dollarsToCents(parseFloat(value));
        if (editAsset) {
          await updateAsset({
            id: editAsset._id,
            name,
            value: cents,
            costBasis: costBasis ? dollarsToCents(parseFloat(costBasis)) : undefined,
            ticker: ticker || undefined,
            units: units ? parseFloat(units) : undefined,
            notes: notes || undefined,
          });
        } else {
          await addAsset({
            name,
            type: type as any,
            value: cents,
            costBasis: costBasis ? dollarsToCents(parseFloat(costBasis)) : undefined,
            ticker: ticker || undefined,
            units: units ? parseFloat(units) : undefined,
            notes: notes || undefined,
          });
        }
      } else {
        const balanceCents = dollarsToCents(parseFloat(value));
        if (editLiability) {
          await updateLiability({
            id: editLiability._id,
            name,
            balance: balanceCents,
            interestRate: parseFloat(interestRate),
            notes: notes || undefined,
          });
        } else {
          await addLiability({
            name,
            type: type as any,
            balance: balanceCents,
            originalBalance: originalBalance ? dollarsToCents(parseFloat(originalBalance)) : balanceCents,
            interestRate: parseFloat(interestRate || "0"),
            lender: lender || undefined,
            startDate,
            notes: notes || undefined,
          });
        }
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      if (mode === "asset" && editAsset) await removeAsset({ id: editAsset._id });
      else if (mode === "liability" && editLiability) await removeLiability({ id: editLiability._id });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const types = mode === "asset" ? ASSET_TYPES : LIABILITY_TYPES;
  const isEditing = mode === "asset" ? !!editAsset : !!editLiability;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-96 bg-surface border-l border-border flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-sm font-medium text-ink">
            {isEditing ? "Edit" : "Add"} {mode === "asset" ? "Asset" : "Liability"}
          </h2>
          <button onClick={onClose} className="text-mid hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none"
              placeholder={mode === "asset" ? "e.g. VAS ETF" : "e.g. CBA Mortgage"}
              required
            />
          </div>

          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none"
              required
            >
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t} value={t}>{t.replace("_", " ").toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
              {mode === "asset" ? "Current Value" : "Outstanding Balance"} (AUD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mid font-mono text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded pl-7 pr-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {mode === "asset" && showInvestmentFields && (
            <>
              <div>
                <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                  placeholder="e.g. VAS"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Units</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Cost Basis ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costBasis}
                    onChange={(e) => setCostBasis(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "liability" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs text-mid uppercase tracking-widest block mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                    placeholder="6.25"
                  />
                </div>
                <div>
                  <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink font-mono text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Lender</label>
                <input
                  type="text"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none"
                  placeholder="e.g. Commonwealth Bank"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-2xs text-mid uppercase tracking-widest block mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded px-3 py-2.5 text-ink text-sm focus:border-gold focus:outline-none resize-none"
              rows={2}
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          {isEditing && (
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>Delete</Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit as any} disabled={loading}>
            {loading ? "Saving…" : isEditing ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
