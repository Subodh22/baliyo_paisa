"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

export function useNetWorth() {
  const assets = useQuery(api.assets.list);
  const liabilities = useQuery(api.liabilities.list);
  const snapshots = useQuery(api.netWorthSnapshots.history, {});

  return useMemo(() => {
    const totalAssets = assets?.reduce((s, a) => s + a.value, 0) ?? 0;
    const totalLiabilities = liabilities?.reduce((s, l) => s + l.balance, 0) ?? 0;
    const netWorth = totalAssets - totalLiabilities;

    const propertyValue =
      assets?.filter((a) => a.type === "property").reduce((s, a) => s + a.value, 0) ?? 0;
    const superBalance =
      assets?.filter((a) => a.type === "super").reduce((s, a) => s + a.value, 0) ?? 0;
    const cashBalance =
      assets?.filter((a) => a.type === "cash").reduce((s, a) => s + a.value, 0) ?? 0;
    const investableAssets = totalAssets - propertyValue;

    return {
      assets: assets ?? [],
      liabilities: liabilities ?? [],
      totalAssets,
      totalLiabilities,
      netWorth,
      propertyValue,
      superBalance,
      cashBalance,
      investableAssets,
      snapshots: snapshots ?? [],
    };
  }, [assets, liabilities, snapshots]);
}
