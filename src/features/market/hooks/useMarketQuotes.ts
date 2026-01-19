import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { GetStockQuoteQueryOptions } from '@/queryOptions/GetStockQuoteQueryOptions';
import type { FinnhubStockQuote } from '@/types/finnhub';

export type MarketSymbol = {
  symbol: string;
  name: string;
};

export type MarketQuote = MarketSymbol & {
  quote?: FinnhubStockQuote;
};

export function useMarketQuotes(items: readonly MarketSymbol[]) {
  const symbols = useMemo(() => items.map(item => item.symbol.toUpperCase()), [items]);

  const queries = useQueries({
    queries: symbols.map(symbol => ({
      ...GetStockQuoteQueryOptions(symbol),
      refetchInterval: 60 * 60 * 1000,
      staleTime: 55 * 60 * 1000,
    })),
  });

  const quoteMap = useMemo(() => {
    const map = new Map<string, FinnhubStockQuote>();
    queries.forEach((query, index) => {
      const symbol = symbols[index];
      if (query.data && symbol) {
        map.set(symbol, query.data);
      }
    });
    return map;
  }, [queries, symbols]);

  const data = useMemo(
    () =>
      items.map(item => ({
        ...item,
        quote: quoteMap.get(item.symbol.toUpperCase()),
      })),
    [items, quoteMap]
  );

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const dataUpdatedAt = Math.max(0, ...queries.map(query => query.dataUpdatedAt ?? 0));
  const error = queries.find(query => query.error)?.error ?? null;

  return {
    data,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
  };
}
