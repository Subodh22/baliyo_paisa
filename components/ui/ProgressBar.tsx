import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  color?: string; // tailwind class or inline
  thick?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, thick, className, showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-border rounded-full overflow-hidden",
          thick ? "h-1.5" : "h-px"
        )}
      >
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-2xs text-mid mt-1 font-mono">{clamped.toFixed(1)}%</p>
      )}
    </div>
  );
}
