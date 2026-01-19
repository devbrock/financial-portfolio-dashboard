import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';

export type SearchSymbolQueryKey = readonly ['symbolSearch', string, string | undefined];

const searchSymbol = async (query: string, exchange?: string) => {
  const { data } = await finnhubApi.searchSymbol(query, exchange);
  return data;
};

const SearchSymbolQueryOptions = (query: string, exchange?: string) => {
  return queryOptions({
    queryKey: ['symbolSearch', query, exchange] as SearchSymbolQueryKey,
    queryFn: () => searchSymbol(query, exchange),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Symbol search is user-triggered and results are relatively stable
    // Cache for 5 minutes to reduce API calls during form interaction
    staleTime: 300000, // 5 minutes in milliseconds
    gcTime: 600000, // Keep in cache for 10 minutes
    // Don't fetch automatically - only when user types
    enabled: query.length > 0,
  });
};

export { SearchSymbolQueryOptions };
