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
  const {
    holdingsWithPrice,
    metrics,
    isLoading,
    isError,
    errorMessage,
    dataUpdatedAt,
  } = usePortfolioData();

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

  const buildSeries = useMemo(() => {
    return (labels: string[], total: number) =>
      labels.map((label, idx) => ({
        month: label,
        profitUsd: total * ((idx + 1) / labels.length),
      }));
  }, []);

  // Simulated performance data - replace with historical transaction data.
  const perf7d: readonly PerformancePoint[] = useMemo(() => {
    const total = metrics.totalPL * 0.2;
    return buildSeries(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], total);
  }, [buildSeries, metrics.totalPL]);

  const perf30d: readonly PerformancePoint[] = useMemo(() => {
    const total = metrics.totalPL * 0.45;
    return buildSeries(["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"], total);
  }, [buildSeries, metrics.totalPL]);

  const perf90d: readonly PerformancePoint[] = useMemo(() => {
    const total = metrics.totalPL * 0.75;
    return buildSeries(["M1", "M2", "M3"], total);
  }, [buildSeries, metrics.totalPL]);

  const perf1y: readonly PerformancePoint[] = useMemo(() => {
    const total = metrics.totalPL;
    return buildSeries(
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      total
    );
  }, [buildSeries, metrics.totalPL]);

  const dailyPlPct = useMemo(() => {
    if (metrics.totalCostBasis === 0) return 0;
    const dailyPlUsd = metrics.totalPL * 0.03;
    return (dailyPlUsd / metrics.totalCostBasis) * 100;
  }, [metrics.totalCostBasis, metrics.totalPL]);

  return {
    assets,
    perf7d,
    perf30d,
    perf90d,
    perf1y,
    allocation,
    holdings,
    isLoading,
    isError,
    errorMessage,
    metrics, // Expose metrics for header (total value, P/L)
    dailyPlPct,
    dataUpdatedAt, // Timestamp of last data update
  };
}
