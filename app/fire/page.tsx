"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFireCalc } from "@/hooks/useFireCalc";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FireSettingsPanel } from "@/components/fire/FireSettingsPanel";
import { FireProjectionChart } from "@/components/charts/FireProjectionChart";
import { formatAUDShort, formatAUD, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function FirePage() {
  const calc = useFireCalc();
  const seedDefaults = useMutation(api.fireSettings.seedDefaults);

  // Seed default settings on first load
  useEffect(() => {
    seedDefaults();
  }, []);

  if (!calc) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <p className="text-sm text-mid">Loading FIRE settings…</p>
      </div>
    );
  }

  const {
    settings,
    fireTarget,
    leanTarget,
    fatTarget,
    coastTarget,
    yearsToFire,
    projectedRetirementAge,
    savingsRate,
    pctToFire,
    isCoastFire,
    realReturn,
    projection,
  } = calc;

  const timeToFireLabel =
    yearsToFire === Infinity
      ? "Never (increase savings)"
      : yearsToFire === 0
      ? "Already FIRE!"
      : `${Math.floor(yearsToFire)}y ${Math.round((yearsToFire % 1) * 12)}m`;

  const scenarios = [
    {
      label: "Lean FIRE",
      spend: settings.leanFireAnnualExpenses,
      fireNum: leanTarget,
      color: "text-mid",
    },
    {
      label: "Standard FIRE",
      spend: settings.targetAnnualExpenses,
      fireNum: fireTarget,
      color: "text-gold",
    },
    {
      label: "Fat FIRE",
      spend: Math.round(settings.targetAnnualExpenses * 1.67),
      fireNum: fatTarget,
      color: "text-ink",
    },
  ];

  return (
    <div className="p-8">
      <SectionHeader
        title="FIRE Calculator"
        subtitle="Financial Independence, Retire Early"
      />

      <div className="flex gap-6">
        {/* Settings panel */}
        <div className="w-72 flex-shrink-0 bg-surface border border-border rounded p-5">
          <FireSettingsPanel settings={settings} />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded p-5 col-span-2">
              <p className="text-2xs text-mid uppercase tracking-widest mb-2">FIRE Number (25× rule)</p>
              <div className="flex items-end gap-4 mb-3">
                <span className="text-4xl font-mono text-gold">
                  {formatAUDShort(fireTarget)}
                </span>
                <span className="text-sm text-mid mb-1">
                  at {settings.withdrawalRate}% SWR
                </span>
              </div>
              <ProgressBar value={pctToFire} thick showLabel />
              <p className="text-xs text-mid mt-2">
                Current portfolio:{" "}
                <span className="font-mono text-ink">
                  {formatAUDShort(calc.portfolioForCalc)}
                </span>{" "}
                · Gap:{" "}
                <span className="font-mono text-ink">
                  {formatAUDShort(Math.max(0, fireTarget - calc.portfolioForCalc))}
                </span>
              </p>
            </div>

            <StatCard
              label="Time to FIRE"
              value={timeToFireLabel}
              subtext={
                projectedRetirementAge
                  ? `Retire at age ${projectedRetirementAge}`
                  : undefined
              }
              accent
            />
            <StatCard
              label="Savings Rate"
              value={formatPct(savingsRate)}
              subtext="Annual"
            />
            <StatCard
              label="Coast FIRE"
              value={formatAUDShort(coastTarget)}
              subtext={isCoastFire ? "✓ Already reached!" : "Required to coast"}
              trend={isCoastFire ? undefined : undefined}
            />
            <StatCard
              label="Real Return Rate"
              value={formatPct(realReturn)}
              subtext={`${settings.expectedReturnRate}% nominal − ${settings.inflationRate}% inflation`}
            />
          </div>

          {/* Projection chart */}
          <div className="bg-surface border border-border rounded p-5">
            <SectionHeader title="Portfolio Projection" subtitle="Real (inflation-adjusted) growth" />
            <FireProjectionChart data={projection} />
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-mid">
                <span className="w-3 h-px bg-gold inline-block" /> Portfolio
              </span>
              <span className="flex items-center gap-1.5 text-mid">
                <span className="w-3 border-t border-dashed border-gold inline-block" /> FIRE Target
              </span>
            </div>
          </div>

          {/* Scenarios table */}
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <SectionHeader title="Scenarios" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-border">
                  {["Scenario", "Annual Spend", "FIRE Number", "FIRE Age"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-2xs text-mid uppercase tracking-widest px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const retAge =
                    settings.currentAge +
                    (yearsToFire === Infinity ? 0 : Math.round(yearsToFire));
                  return (
                    <tr
                      key={s.label}
                      className="border-b border-border last:border-0"
                    >
                      <td className={cn("px-5 py-3 text-sm font-medium", s.color)}>
                        {s.label}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-mid">
                        {formatAUD(s.spend)}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-ink">
                        {formatAUDShort(s.fireNum)}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-mid">
                        {s.label === "Standard FIRE" && projectedRetirementAge
                          ? projectedRetirementAge
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
