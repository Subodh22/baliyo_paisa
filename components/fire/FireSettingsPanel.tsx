"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { dollarsToCents, centsToDollars } from "@/lib/format";
import { Button } from "@/components/ui/Button";

interface FireSettings {
  currentAge: number;
  targetRetirementAge: number;
  currentAnnualExpenses: number;
  targetAnnualExpenses: number;
  leanFireAnnualExpenses: number;
  expectedReturnRate: number;
  inflationRate: number;
  withdrawalRate: number;
  currentPortfolioValue: number;
  annualSavingsContribution: number;
  superBalance: number;
  superContributionRate: number;
  preservationAge: number;
  includeSuper: boolean;
}

interface Props {
  settings: FireSettings;
}

function SettingRow({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "1",
  min = "0",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <label className="text-xs text-mid flex-1 pr-4">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-xs text-mid font-mono">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          min={min}
          className="w-24 bg-transparent border-b border-border text-right text-sm font-mono text-ink focus:border-gold focus:outline-none py-0.5 px-1"
        />
        {suffix && <span className="text-xs text-mid font-mono">{suffix}</span>}
      </div>
    </div>
  );
}

export function FireSettingsPanel({ settings }: Props) {
  const upsert = useMutation(api.fireSettings.upsert);

  const [currentAge, setCurrentAge] = useState(String(settings.currentAge));
  const [retirementAge, setRetirementAge] = useState(String(settings.targetRetirementAge));
  const [portfolio, setPortfolio] = useState(String(centsToDollars(settings.currentPortfolioValue)));
  const [contribution, setContribution] = useState(String(centsToDollars(settings.annualSavingsContribution)));
  const [super_, setSuper] = useState(String(centsToDollars(settings.superBalance)));
  const [targetSpend, setTargetSpend] = useState(String(centsToDollars(settings.targetAnnualExpenses)));
  const [leanSpend, setLeanSpend] = useState(String(centsToDollars(settings.leanFireAnnualExpenses)));
  const [returnRate, setReturnRate] = useState(String(settings.expectedReturnRate));
  const [inflation, setInflation] = useState(String(settings.inflationRate));
  const [swr, setSwr] = useState(String(settings.withdrawalRate));
  const [includeSuper, setIncludeSuper] = useState(settings.includeSuper);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await upsert({
        currentAge: Number(currentAge),
        targetRetirementAge: Number(retirementAge),
        currentAnnualExpenses: dollarsToCents(Number(targetSpend)),
        targetAnnualExpenses: dollarsToCents(Number(targetSpend)),
        leanFireAnnualExpenses: dollarsToCents(Number(leanSpend)),
        expectedReturnRate: Number(returnRate),
        inflationRate: Number(inflation),
        withdrawalRate: Number(swr),
        currentPortfolioValue: dollarsToCents(Number(portfolio)),
        annualSavingsContribution: dollarsToCents(Number(contribution)),
        superBalance: dollarsToCents(Number(super_)),
        superContributionRate: settings.superContributionRate,
        preservationAge: settings.preservationAge,
        includeSuper,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xs text-mid uppercase tracking-widest mb-3">Your Numbers</p>
        <SettingRow label="Current age" value={currentAge} onChange={setCurrentAge} suffix="yrs" />
        <SettingRow label="Target retirement age" value={retirementAge} onChange={setRetirementAge} suffix="yrs" />
        <SettingRow label="Portfolio value" value={portfolio} onChange={setPortfolio} prefix="$" step="1000" />
        <SettingRow label="Annual savings" value={contribution} onChange={setContribution} prefix="$" step="1000" />
        <SettingRow label="Super balance" value={super_} onChange={setSuper} prefix="$" step="1000" />
      </div>

      <div>
        <p className="text-2xs text-mid uppercase tracking-widest mb-3">Target Spending</p>
        <SettingRow label="FIRE annual spend" value={targetSpend} onChange={setTargetSpend} prefix="$" step="1000" />
        <SettingRow label="Lean FIRE spend" value={leanSpend} onChange={setLeanSpend} prefix="$" step="1000" />
      </div>

      <div>
        <p className="text-2xs text-mid uppercase tracking-widest mb-3">Assumptions</p>
        <SettingRow label="Expected return (nominal)" value={returnRate} onChange={setReturnRate} suffix="%" step="0.5" />
        <SettingRow label="Inflation rate" value={inflation} onChange={setInflation} suffix="%" step="0.5" />
        <SettingRow label="Safe withdrawal rate" value={swr} onChange={setSwr} suffix="%" step="0.5" />
        <div className="flex items-center justify-between py-2">
          <label className="text-xs text-mid">Include super in calc</label>
          <input
            type="checkbox"
            checked={includeSuper}
            onChange={(e) => setIncludeSuper(e.target.checked)}
            className="accent-gold"
          />
        </div>
      </div>

      <Button variant="primary" size="sm" className="w-full justify-center" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Update Settings"}
      </Button>
    </div>
  );
}
