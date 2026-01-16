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
  const { holdingsWithPrice, metrics, isLoading, isError, dataUpdatedAt } =
    usePortfolioData();

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
        logo: holding.logo,
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
      logo: holding.logo,
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
  // Simulate realistic period-specific profits
  const perfDaily: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;
    // Daily profit is estimated as ~3% of total P/L
    const dailyProfit = currentPL * 0.03;
    const base = dailyProfit / 5;

    return [
      { month: "6am", profitUsd: base * 0.5 },
      { month: "9am", profitUsd: base * 1.2 },
      { month: "12pm", profitUsd: base * 2.1 },
      { month: "3pm", profitUsd: base * 3.5 },
      { month: "6pm", profitUsd: dailyProfit },
    ];
  }, [metrics.totalPL]);

  const perfWeekly: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;
    // Weekly profit is estimated as ~20% of total P/L
    const weeklyProfit = currentPL * 0.2;
    const base = weeklyProfit / 7;

    return [
      { month: "Mon", profitUsd: base * 0.8 },
      { month: "Tue", profitUsd: base * 1.6 },
      { month: "Wed", profitUsd: base * 2.2 },
      { month: "Thu", profitUsd: base * 3.5 },
      { month: "Fri", profitUsd: base * 5.2 },
      { month: "Sat", profitUsd: base * 6.1 },
      { month: "Sun", profitUsd: weeklyProfit },
    ];
  }, [metrics.totalPL]);

  const perfMonthly: readonly PerformancePoint[] = useMemo(() => {
    const currentPL = metrics.totalPL;
    // Monthly shows full current P/L accumulated over the year
    return [
      { month: "Jan", profitUsd: currentPL * 0.08 },
      { month: "Feb", profitUsd: currentPL * 0.15 },
      { month: "Mar", profitUsd: currentPL * 0.22 },
      { month: "Apr", profitUsd: currentPL * 0.35 },
      { month: "May", profitUsd: currentPL * 0.48 },
      { month: "Jun", profitUsd: currentPL * 0.62 },
      { month: "Jul", profitUsd: currentPL * 0.75 },
      { month: "Aug", profitUsd: currentPL * 0.88 },
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
    dataUpdatedAt, // Timestamp of last data update
  };
}
