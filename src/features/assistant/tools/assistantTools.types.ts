import type { HoldingWithPrice, PortfolioMetrics, WatchlistItemWithPrice } from '@/types/portfolio';
import type { MarketQuote } from '@/features/market/hooks/useMarketQuotes';

/**
 * Data payload passed to the assistant tool context builder.
 */
export type AssistantToolData = {
  question: string;
  holdings: HoldingWithPrice[];
  watchlist: WatchlistItemWithPrice[];
  metrics: PortfolioMetrics;
  portfolioUpdatedAt: number;
  marketIndices: MarketQuote[];
  marketUpdatedAt: number;
};

