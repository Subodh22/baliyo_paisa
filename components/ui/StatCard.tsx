import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtext?: string;
  trend?: number; // positive = up, negative = down (percentage)
  accent?: boolean; // gold left border
  className?: string;
}

export function StatCard({ label, value, subtext, trend, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border p-5 rounded",
        accent && "border-l-2 border-l-gold",
        className
      )}
    >
      <p className="text-2xs text-mid uppercase tracking-widest mb-3">{label}</p>
      <div className="text-2xl font-mono font-medium text-ink">{value}</div>
      {(subtext || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && (
            <span
              className={cn(
                "text-xs font-mono",
                trend >= 0 ? "text-green-muted" : "text-red-muted"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
          )}
          {subtext && <p className="text-xs text-mid">{subtext}</p>}
        </div>
      )}
    </div>
  );
}
