import type { HoldingWithPrice, WatchlistItemWithPrice } from '@/types/portfolio';
import type { MarketQuote } from '@/features/market/hooks/useMarketQuotes';

/**
 * Formats a number as USD currency.
 */
export const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

/**
 * Formats a number as a percentage.
 */
export const formatPct = (value: number): string => `${value.toFixed(2)}%`;

/**
 * Formats a timestamp as a localized date string.
 */
export const formatUpdatedAt = (timestamp: number): string | null => {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleString();
};

/**
 * Converts a Date object to an ISO date key (YYYY-MM-DD).
 */
export const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Formats a holding for display in assistant context.
 */
export const formatHolding = (holding: HoldingWithPrice): string => {
  const label = holding.companyName?.trim() || holding.symbol.toUpperCase();
  const symbol = holding.symbol.toUpperCase();
  return `${label} (${symbol}) ${formatCurrency(holding.currentPrice)} | ${formatPct(holding.plPct)}`;
};

/**
 * Formats a watchlist item for display in assistant context.
 */
export const formatWatchlistItem = (item: WatchlistItemWithPrice): string => {
  const label = item.companyName?.trim() || item.symbol.toUpperCase();
  const symbol = item.symbol.toUpperCase();
  return `${label} (${symbol}) ${formatCurrency(item.currentPrice)} | ${formatPct(item.changePct)}`;
};

/**
 * Formats a market index quote for display in assistant context.
 */
export const formatIndex = (quote: MarketQuote): string => {
  const price = quote.quote?.c ?? 0;
  const changePct = quote.quote?.dp ?? 0;
  return `${quote.name} (${quote.symbol}) ${formatCurrency(price)} | ${formatPct(changePct)}`;
};
