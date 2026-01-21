import { useCallback, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { GetCompanyNewsQueryOptions } from '@/queryOptions/GetCompanyNewsQueryOptions';
import type { FinnhubNewsItem } from '@/types/finnhub';
import { QUERY_TIMINGS } from '@/queryOptions/queryTimings';

export function useCompanyNews(symbols: readonly string[], from: string, to: string) {
  const queries = useQueries({
    queries: symbols.map(symbol => ({
      ...GetCompanyNewsQueryOptions(symbol, from, to),
      refetchInterval: QUERY_TIMINGS.hourly.refetchInterval,
      staleTime: QUERY_TIMINGS.hourly.staleTime,
      gcTime: QUERY_TIMINGS.hourly.gcTime,
    })),
  });

  const newsBySymbol = useMemo(() => {
    const map = new Map<string, FinnhubNewsItem[]>();
    symbols.forEach((symbol, index) => {
      const data = queries[index]?.data ?? [];
      map.set(symbol, data);
    });
    return map;
  }, [queries, symbols]);

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const error = queries.find(query => query.error)?.error ?? null;
  const refetch = useCallback(() => Promise.all(queries.map(query => query.refetch())), [queries]);

  return {
    newsBySymbol,
    isLoading,
    isError,
    error,
    refetch,
  };
}
