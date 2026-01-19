import { useMemo } from "react";
import { usePortfolioData } from "@/features/portfolio/hooks/usePortfolioData";
import type {
  AllocationSlice,
  HoldingRow,
  WatchlistCardModel,
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
    watchlistWithPrice,
    metrics,
    isLoading,
    isError,
    errorMessage,
    dataUpdatedAt,
  } = usePortfolioData();

  const watchlist: readonly WatchlistCardModel[] = useMemo(() => {
    return watchlistWithPrice.map((item) => ({
      id: item.id,
      name: item.companyName || item.symbol,
      ticker:
        item.assetType === "stock"
          ? item.symbol.toUpperCase()
          : item.symbol.toUpperCase(),
      priceUsd: item.currentPrice,
      changePct: item.changePct,
      logo: item.logo,
    }));
  }, [watchlistWithPrice]);

  // Transform holdings into table rows
  const holdings: readonly HoldingRow[] = useMemo(() => {
    return holdingsWithPrice.map((holding) => ({
      id: holding.id,
      name: holding.companyName || holding.symbol,
      ticker: holding.symbol.toUpperCase(),
      date: formatDate(holding.purchaseDate),
      volume: holding.quantity,
      changePct: holding.plPct,
      purchasePrice: holding.purchasePrice,
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

  const dailyPlPct = useMemo(() => {
    if (metrics.totalCostBasis === 0) return 0;
    const dailyPlUsd = metrics.totalPL * 0.03;
    return (dailyPlUsd / metrics.totalCostBasis) * 100;
  }, [metrics.totalCostBasis, metrics.totalPL]);

  return {
    allocation,
    holdings,
    isLoading,
    isError,
    errorMessage,
    metrics, // Expose metrics for header (total value, P/L)
    dailyPlPct,
    watchlist,
    dataUpdatedAt, // Timestamp of last data update
  };
}
