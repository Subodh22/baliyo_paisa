"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Flame,
  Wallet,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/cashflow", label: "Cash Flow", icon: TrendingUp },
  { href: "/budget", label: "Budget", icon: Calculator },
  { href: "/fire", label: "FIRE", icon: Flame },
  { href: "/networth", label: "Net Worth", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <span className="font-mono text-lg font-medium text-gold tracking-widest uppercase">
          Paisa
        </span>
        <p className="text-2xs text-mid mt-0.5 uppercase tracking-widest">
          FIRE Tracker
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                active
                  ? "bg-gold-dim text-gold"
                  : "text-mid hover:text-ink hover:bg-surface-alt"
              )}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span className={cn("font-medium", active ? "" : "font-normal")}>
                {label}
              </span>
              {active && (
                <div className="ml-auto w-px h-4 bg-gold opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-2xs text-mid uppercase tracking-widest">
          AUD · Australia
        </p>
      </div>
    </aside>
  );
}
