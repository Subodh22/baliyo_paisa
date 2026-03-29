"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useNetWorth } from "@/hooks/useNetWorth";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { AccountModal } from "@/components/networth/AccountModal";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { formatAUDShort, formatAUD } from "@/lib/format";
import { Plus, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const assetTypeLabel: Record<string, string> = {
  cash: "Cash & Savings", super: "Superannuation", etf: "ETFs",
  shares: "Shares", property: "Property", bonds: "Bonds", crypto: "Crypto", other: "Other",
};

const liabilityTypeLabel: Record<string, string> = {
  mortgage: "Mortgage", personal_loan: "Personal Loan", car_loan: "Car Loan",
  credit_card: "Credit Card", hecs: "HECS Debt", other: "Other",
};

export default function NetWorthPage() {
  const nw = useNetWorth();
  const takeSnapshot = useMutation(api.netWorthSnapshots.takeSnapshot);

  const [assetModal, setAssetModal] = useState(false);
  const [liabilityModal, setLiabilityModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Doc<"assets"> | null>(null);
  const [editLiability, setEditLiability] = useState<Doc<"liabilities"> | null>(null);
  const [snapping, setSnapping] = useState(false);

  async function handleSnapshot() {
    setSnapping(true);
    try {
      await takeSnapshot({
        totalAssets: nw.totalAssets,
        totalLiabilities: nw.totalLiabilities,
        investableAssets: nw.investableAssets,
        superBalance: nw.superBalance,
        cashBalance: nw.cashBalance,
        propertyValue: nw.propertyValue,
      });
    } finally {
      setSnapping(false);
    }
  }

  // Group assets by type
  const assetsByType = nw.assets.reduce<Record<string, typeof nw.assets>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  const liabilityByType = nw.liabilities.reduce<Record<string, typeof nw.liabilities>>((acc, l) => {
    if (!acc[l.type]) acc[l.type] = [];
    acc[l.type].push(l);
    return acc;
  }, {});

  const lastSnapshot = nw.snapshots[nw.snapshots.length - 1];
  const prevSnapshot = nw.snapshots[nw.snapshots.length - 2];
  const netWorthTrend = prevSnapshot && prevSnapshot.netWorth !== 0
    ? ((nw.netWorth - prevSnapshot.netWorth) / Math.abs(prevSnapshot.netWorth)) * 100
    : undefined;

  return (
    <div className="p-8">
      <SectionHeader
        title="Net Worth"
        subtitle="Assets, liabilities, and wealth over time"
        action={
          <Button variant="secondary" size="sm" onClick={handleSnapshot} disabled={snapping}>
            <Camera size={14} /> {snapping ? "Saving…" : "Take Snapshot"}
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Net Worth"
          value={formatAUDShort(nw.netWorth)}
          trend={netWorthTrend}
          accent
        />
        <StatCard label="Total Assets" value={formatAUDShort(nw.totalAssets)} />
        <StatCard label="Total Liabilities" value={formatAUDShort(nw.totalLiabilities)} />
        <StatCard label="Investable Assets" value={formatAUDShort(nw.investableAssets)}
          subtext="Excl. property" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Assets */}
        <div className="bg-surface border border-border rounded p-5">
          <SectionHeader
            title="Assets"
            action={
              <Button variant="ghost" size="sm" onClick={() => { setEditAsset(null); setAssetModal(true); }}>
                <Plus size={13} /> Add
              </Button>
            }
          />
          {Object.keys(assetsByType).length === 0 ? (
            <p className="text-sm text-mid py-6 text-center">No assets added yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(assetsByType).map(([type, items]) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xs text-mid uppercase tracking-widest">
                      {assetTypeLabel[type] ?? type}
                    </span>
                    <span className="text-xs font-mono text-mid">
                      {formatAUDShort(items.reduce((s, a) => s + a.value, 0))}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((a) => (
                      <div
                        key={a._id}
                        onClick={() => { setEditAsset(a); setAssetModal(true); }}
                        className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-surface-alt cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm text-ink">{a.name}</p>
                          {a.ticker && (
                            <p className="text-2xs text-mid font-mono">
                              {a.ticker} {a.units ? `× ${a.units}` : ""}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-ink">{formatAUD(a.value)}</p>
                          {a.costBasis && a.value !== a.costBasis && (
                            <p className={cn(
                              "text-2xs font-mono",
                              a.value >= a.costBasis ? "text-green-muted" : "text-red-muted"
                            )}>
                              {a.value >= a.costBasis ? "+" : ""}
                              {formatAUDShort(a.value - a.costBasis)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liabilities */}
        <div className="bg-surface border border-border rounded p-5">
          <SectionHeader
            title="Liabilities"
            action={
              <Button variant="ghost" size="sm" onClick={() => { setEditLiability(null); setLiabilityModal(true); }}>
                <Plus size={13} /> Add
              </Button>
            }
          />
          {Object.keys(liabilityByType).length === 0 ? (
            <p className="text-sm text-mid py-6 text-center">No liabilities added yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(liabilityByType).map(([type, items]) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xs text-mid uppercase tracking-widest">
                      {liabilityTypeLabel[type] ?? type}
                    </span>
                    <span className="text-xs font-mono text-mid">
                      {formatAUDShort(items.reduce((s, l) => s + l.balance, 0))}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((l) => (
                      <div
                        key={l._id}
                        onClick={() => { setEditLiability(l); setLiabilityModal(true); }}
                        className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-surface-alt cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-sm text-ink">{l.name}</p>
                          {l.lender && (
                            <p className="text-2xs text-mid">{l.lender} · {l.interestRate}% p.a.</p>
                          )}
                        </div>
                        <p className="text-sm font-mono text-red-muted">
                          {formatAUD(l.balance)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className="bg-surface border border-border rounded p-5">
        <SectionHeader title="Net Worth History" subtitle="Monthly snapshots" />
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-3 h-px bg-gold inline-block" /> Net Worth
          </span>
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-3 border-t border-dashed border-mid inline-block" /> Investable
          </span>
        </div>
        <NetWorthChart data={nw.snapshots} />
      </div>

      <AccountModal
        open={assetModal}
        onClose={() => { setAssetModal(false); setEditAsset(null); }}
        mode="asset"
        editAsset={editAsset}
      />
      <AccountModal
        open={liabilityModal}
        onClose={() => { setLiabilityModal(false); setEditLiability(null); }}
        mode="liability"
        editLiability={editLiability}
      />
    </div>
  );
}
