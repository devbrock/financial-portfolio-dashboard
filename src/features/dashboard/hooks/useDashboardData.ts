import { useMemo } from "react";
import { usePortfolioData } from "@/features/portfolio/hooks/usePortfolioData";
import type {
  AssetCardModel,
  PerformancePoint,
  AllocationSlice,
  HoldingRow,
} from "@/types/dashboard";

/**
 * Format date for display in holdings table
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function useDashboardData() {
  const { holdingsWithPrice, metrics, isLoading, isError } = usePortfolioData();

  // Transform holdings into asset cards (top 4 by value)
  const assets: readonly AssetCardModel[] = useMemo(() => {
    return [...holdingsWithPrice]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 4)
      .map((holding) => ({
        id: holding.id,
        name: holding.companyName || holding.symbol,
        ticker: holding.symbol.toUpperCase(),
        valueUsd: holding.currentValue,
        weeklyDeltaPct: holding.plPct, // Using total P/L% as weekly delta for now
      }));
  }, [holdingsWithPrice]);

  // Transform holdings into table rows
  const holdings: readonly HoldingRow[] = useMemo(() => {
    return holdingsWithPrice.map((holding) => ({
      id: holding.id,
      name: holding.companyName || holding.symbol,
      ticker: holding.symbol.toUpperCase(),
      date: formatDate(holding.purchaseDate),
      volume: holding.quantity,
      changePct: holding.plPct,
      priceUsd: holding.currentPrice,
      pnlUsd: holding.plUsd,
      status: "active" as const, // All holdings are active in this demo
    }));
  }, [holdingsWithPrice]);

  // Transform metrics into allocation chart data
  const allocation: readonly AllocationSlice[] = useMemo(() => {
    // Only show stocks and crypto (no ETFs/Bonds in our data model)
    const slices: AllocationSlice[] = [];

    if (metrics.stockPct > 0) {
      slices.push({
        name: "Stocks",
        value: metrics.stockPct,
        color: "var(--ui-primary)",
      });
    }

    if (metrics.cryptoPct > 0) {
      slices.push({
        name: "Crypto",
        value: metrics.cryptoPct,
        color: "color-mix(in oklab, var(--ui-accent) 45%, white 55%)",
      });
    }

    return slices;
  }, [metrics]);

  // Mock performance data - will be replaced with historical transaction data
  // For now, we'll generate simple mock data based on current P/L
  const perfDaily: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;
    const dailyBase = currentPL / 5;

    return [
      { month: "6am", profitUsd: dailyBase * 0.2 },
      { month: "9am", profitUsd: dailyBase * 0.4 },
      { month: "12pm", profitUsd: dailyBase * 0.6 },
      { month: "3pm", profitUsd: dailyBase * 0.8 },
      { month: "6pm", profitUsd: currentPL },
    ];
  }, [metrics.totalPL]);

  const perfWeekly: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;
    const weeklyBase = currentPL / 7;

    return [
      { month: "Mon", profitUsd: weeklyBase * 2 },
      { month: "Tue", profitUsd: weeklyBase * 3 },
      { month: "Wed", profitUsd: weeklyBase * 2.5 },
      { month: "Thu", profitUsd: weeklyBase * 4 },
      { month: "Fri", profitUsd: weeklyBase * 5 },
      { month: "Sat", profitUsd: weeklyBase * 4.5 },
      { month: "Sun", profitUsd: currentPL },
    ];
  }, [metrics.totalPL]);

  const perfMonthly: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;

    return [
      { month: "Jan", profitUsd: currentPL * 0.1 },
      { month: "Feb", profitUsd: currentPL * 0.2 },
      { month: "Mar", profitUsd: currentPL * 0.18 },
      { month: "Apr", profitUsd: currentPL * 0.3 },
      { month: "May", profitUsd: currentPL * 0.4 },
      { month: "Jun", profitUsd: currentPL * 0.5 },
      { month: "Jul", profitUsd: currentPL * 0.6 },
      { month: "Aug", profitUsd: currentPL * 0.85 },
      { month: "Sep", profitUsd: currentPL },
    ];
  }, [metrics.totalPL]);

  return {
    assets,
    perfDaily,
    perfWeekly,
    perfMonthly,
    allocation,
    holdings,
    isLoading,
    isError,
    metrics, // Expose metrics for header (total value, P/L)
  };
}
