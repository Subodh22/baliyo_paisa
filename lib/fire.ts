/**
 * All monetary inputs are AUD cents (integers).
 * Rate inputs are percentages (e.g. 7.0 means 7%).
 * Returns are AUD cents unless noted.
 */

/** Real (inflation-adjusted) return rate from nominal rate and inflation rate. */
export function realReturnRate(nominalPct: number, inflationPct: number): number {
  return ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;
}

/** FIRE number using Safe Withdrawal Rate (default 4% → 25× expenses). */
export function fireNumber(targetAnnualExpensesCents: number, withdrawalRatePct: number): number {
  return Math.round(targetAnnualExpensesCents * (100 / withdrawalRatePct));
}

/** Lean FIRE number. */
export function leanFireNumber(leanAnnualExpensesCents: number, withdrawalRatePct: number): number {
  return fireNumber(leanAnnualExpensesCents, withdrawalRatePct);
}

/** Fat FIRE number — typically 2× standard FIRE spend. */
export function fatFireNumber(fatAnnualExpensesCents: number, withdrawalRatePct: number): number {
  return fireNumber(fatAnnualExpensesCents, withdrawalRatePct);
}

/**
 * Coast FIRE number: amount needed NOW so portfolio grows to FIRE number
 * by targetRetirementAge without additional contributions.
 */
export function coastFireNumber(
  fireNumberCents: number,
  yearsToRetirement: number,
  realReturnRatePct: number
): number {
  const r = realReturnRatePct / 100;
  return Math.round(fireNumberCents / Math.pow(1 + r, yearsToRetirement));
}

/**
 * Future value of a portfolio with annual contributions.
 * PV: current portfolio (cents)
 * PMT: annual contribution (cents)
 * r: real return rate (%)
 * n: years
 */
export function futureValue(
  pvCents: number,
  pmtCents: number,
  realReturnRatePct: number,
  years: number
): number {
  const r = realReturnRatePct / 100;
  if (r === 0) return pvCents + pmtCents * years;
  const growth = Math.pow(1 + r, years);
  return Math.round(pvCents * growth + pmtCents * ((growth - 1) / r));
}

/**
 * Years until portfolio reaches target value (binary search).
 * Returns Infinity if never reached (negative savings).
 */
export function yearsToFire(
  currentPortfolioCents: number,
  annualContributionCents: number,
  fireNumberCents: number,
  realReturnRatePct: number,
  maxYears = 100
): number {
  if (currentPortfolioCents >= fireNumberCents) return 0;
  if (annualContributionCents <= 0 && realReturnRatePct <= 0) return Infinity;

  for (let y = 1; y <= maxYears; y++) {
    const fv = futureValue(currentPortfolioCents, annualContributionCents, realReturnRatePct, y);
    if (fv >= fireNumberCents) return y;
  }
  return Infinity;
}

/** Savings rate as a percentage. */
export function savingsRate(incomeCents: number, expensesCents: number): number {
  if (incomeCents <= 0) return 0;
  return Math.max(0, ((incomeCents - expensesCents) / incomeCents) * 100);
}

/** Net worth = total assets - total liabilities (all in cents). */
export function netWorth(totalAssetsCents: number, totalLiabilitiesCents: number): number {
  return totalAssetsCents - totalLiabilitiesCents;
}

/**
 * Build a projection array: one data point per year from now until maxYears.
 * Useful for charting portfolio growth vs FIRE number.
 */
export interface ProjectionPoint {
  year: number;
  age: number;
  portfolioValue: number; // cents
  fireTarget: number;     // cents
  coastFireTarget: number; // cents
}

export function buildFireProjection(params: {
  currentAge: number;
  currentPortfolioCents: number;
  annualContributionCents: number;
  fireTargetCents: number;
  coastFireTargetCents: number;
  realReturnRatePct: number;
  maxYears?: number;
}): ProjectionPoint[] {
  const {
    currentAge,
    currentPortfolioCents,
    annualContributionCents,
    fireTargetCents,
    coastFireTargetCents,
    realReturnRatePct,
    maxYears = 40,
  } = params;

  const points: ProjectionPoint[] = [];
  for (let y = 0; y <= maxYears; y++) {
    points.push({
      year: y,
      age: currentAge + y,
      portfolioValue: futureValue(
        currentPortfolioCents,
        annualContributionCents,
        realReturnRatePct,
        y
      ),
      fireTarget: fireTargetCents,
      coastFireTarget: coastFireTargetCents,
    });
    // Stop projecting far past FIRE
    if (y > 5 && points[y].portfolioValue >= fireTargetCents * 1.5) break;
  }
  return points;
}
