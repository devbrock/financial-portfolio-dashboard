import { useQueries } from '@tanstack/react-query';
import { GetStockQuoteQueryOptions } from '@/queryOptions/GetStockQuoteQueryOptions';
import type { FinnhubStockQuote } from '@/types/finnhub';

/**
 * Fetch stock prices for multiple symbols in parallel
 */
export function useStockPrices(symbols: string[]) {
  const queries = useQueries({
    queries: symbols.map(symbol => GetStockQuoteQueryOptions(symbol)),
  });

  // Extract data and loading states
  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const error = queries.find(query => query.error)?.error ?? null;

  // Get latest data updated timestamp
  const dataUpdatedAt = Math.max(...queries.map(q => q.dataUpdatedAt || 0), 0);

  // Create map of symbol -> quote data
  const quoteMap = new Map<string, FinnhubStockQuote>();
  queries.forEach((query, index) => {
    if (query.data) {
      quoteMap.set(symbols[index], query.data);
    }
  });

  return {
    quoteMap,
    isLoading,
    isError,
    dataUpdatedAt,
    queries,
    error,
  };
}
