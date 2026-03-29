import { formatAUD, formatAUDShort } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MonoNumberProps {
  cents: number;
  short?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
};

export function MonoNumber({ cents, short, size = "md", showSign, className }: MonoNumberProps) {
  const formatted = short ? formatAUDShort(cents) : formatAUD(cents);
  const sign = showSign && cents > 0 ? "+" : "";

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        sizeMap[size],
        cents < 0 ? "text-red-muted" : cents > 0 ? "text-ink" : "text-mid",
        className
      )}
    >
      {sign}
      {formatted}
    </span>
  );
}
