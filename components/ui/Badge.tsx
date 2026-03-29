import { getCategoryColor, getCategoryLabel } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface BadgeProps {
  category?: string;
  variant?: "income" | "expense" | "neutral";
  label?: string;
  className?: string;
}

export function Badge({ category, variant, label, className }: BadgeProps) {
  const color = category ? getCategoryColor(category) : undefined;
  const text = label ?? (category ? getCategoryLabel(category) : "");

  if (variant === "income") {
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-green-muted/10 text-green-muted", className)}>
        income
      </span>
    );
  }
  if (variant === "expense") {
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-red-muted/10 text-red-muted", className)}>
        expense
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-surface-alt border border-border text-mid",
        className
      )}
    >
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {text}
    </span>
  );
}
