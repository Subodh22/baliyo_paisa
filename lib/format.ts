// All monetary values stored as AUD cents (integer). These helpers convert for display.

export type Frequency = "weekly" | "fortnightly" | "monthly" | "quarterly" | "annually";

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly",      label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly",     label: "Monthly" },
  { value: "quarterly",   label: "Quarterly" },
  { value: "annually",    label: "Annually" },
];

/** Multiplier to convert a frequency amount to monthly equivalent */
export const FREQ_TO_MONTHLY: Record<Frequency, number> = {
  weekly:      52 / 12,   // ~4.333
  fortnightly: 26 / 12,   // ~2.167
  monthly:     1,
  quarterly:   1 / 3,     // ~0.333
  annually:    1 / 12,    // ~0.083
};

/** Convert a raw amount (in cents) at a given frequency → monthly cents */
export function toMonthlyCents(cents: number, freq: Frequency): number {
  return Math.round(cents * FREQ_TO_MONTHLY[freq]);
}

/** Convert monthly cents back to the raw amount at a given frequency */
export function fromMonthlyCents(monthlyCents: number, freq: Frequency): number {
  return Math.round(monthlyCents / FREQ_TO_MONTHLY[freq]);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format AUD cents as a currency string.
 * e.g. 150000 → "$1,500"
 */
export function formatAUD(cents: number, decimals = 0): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(dollars);
}

/**
 * Short format for large numbers: $1.5M, $250K etc.
 */
export function formatAUDShort(cents: number): string {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(dollars) >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0)}K`;
  }
  return formatAUD(cents);
}

/**
 * Format a percentage value.
 * e.g. 42.5 → "42.5%"
 */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a signed delta with + or - prefix.
 */
export function formatDelta(cents: number): string {
  const sign = cents >= 0 ? "+" : "";
  return `${sign}${formatAUDShort(cents)}`;
}

/**
 * Format a YYYY-MM-DD date string to display format.
 * e.g. "2026-03-29" → "29 Mar 2026"
 */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a YYYY-MM month string to display format.
 * e.g. "2026-03" → "Mar 2026"
 */
export function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Get current YYYY-MM string.
 */
export function currentYearMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Get current YYYY-MM-DD string.
 */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
