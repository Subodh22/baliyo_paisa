"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  fireNumber,
  leanFireNumber,
  coastFireNumber,
  yearsToFire,
  savingsRate,
  realReturnRate,
  buildFireProjection,
} from "@/lib/fire";
import { useMemo } from "react";

export function useFireCalc() {
  const settings = useQuery(api.fireSettings.get);

  return useMemo(() => {
    if (!settings) return null;

    const realReturn = realReturnRate(settings.expectedReturnRate, settings.inflationRate);
    const yearsToRetirement = settings.targetRetirementAge - settings.currentAge;

    const fireTarget = fireNumber(settings.targetAnnualExpenses, settings.withdrawalRate);
    const leanTarget = leanFireNumber(settings.leanFireAnnualExpenses, settings.withdrawalRate);
    const fatTarget = fireNumber(
      Math.round(settings.targetAnnualExpenses * 1.67),
      settings.withdrawalRate
    ); // ~Fat FIRE at ~$100k if standard is $60k

    const portfolioForCalc = settings.includeSuper
      ? settings.currentPortfolioValue + settings.superBalance
      : settings.currentPortfolioValue;

    const coastTarget = coastFireNumber(fireTarget, yearsToRetirement, realReturn);

    const yToFire = yearsToFire(
      portfolioForCalc,
      settings.annualSavingsContribution,
      fireTarget,
      realReturn
    );

    const projectedRetirementAge =
      yToFire === Infinity ? null : Math.round(settings.currentAge + yToFire);

    const rate = savingsRate(
      settings.currentAnnualExpenses + settings.annualSavingsContribution,
      settings.currentAnnualExpenses
    );

    const pctToFire =
      fireTarget > 0 ? Math.min(100, (portfolioForCalc / fireTarget) * 100) : 0;

    const isCoastFire = portfolioForCalc >= coastTarget;

    const projection = buildFireProjection({
      currentAge: settings.currentAge,
      currentPortfolioCents: portfolioForCalc,
      annualContributionCents: settings.annualSavingsContribution,
      fireTargetCents: fireTarget,
      coastFireTargetCents: coastTarget,
      realReturnRatePct: realReturn,
    });

    return {
      settings,
      fireTarget,
      leanTarget,
      fatTarget,
      coastTarget,
      yearsToFire: yToFire,
      projectedRetirementAge,
      savingsRate: rate,
      pctToFire,
      isCoastFire,
      realReturn,
      portfolioForCalc,
      projection,
    };
  }, [settings]);
}
