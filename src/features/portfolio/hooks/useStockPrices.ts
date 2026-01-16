import { useQueries } from "@tanstack/react-query";
import { GetStockQuoteQueryOptions } from "@/queryOptions/GetStockQuoteQueryOptions";

/**
 * Fetch stock prices for multiple symbols in parallel
 */
export function useStockPrices(symbols: string[]) {
  const queries = useQueries({
    queries: symbols.map((symbol) => GetStockQuoteQueryOptions(symbol)),
  });

  // Extract data and loading states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  // Create map of symbol -> price
  const priceMap = new Map<string, number>();
  queries.forEach((query, index) => {
    if (query.data) {
      priceMap.set(symbols[index], query.data.c);
    }
  });

  return {
    priceMap,
    isLoading,
    isError,
    queries,
  };
}
