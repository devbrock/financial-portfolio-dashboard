import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi } from '@functions/coinGeckoApi';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

export type SearchCryptoQueryKey = readonly ['cryptoSearch', string];

const searchCrypto = async (query: string) => {
  const { data } = await coinGeckoApi.searchCoins(query);
  return data;
};

const SearchCryptoQueryOptions = (query: string) => {
  return queryOptions({
    queryKey: ['cryptoSearch', query] as SearchCryptoQueryKey,
    queryFn: () => searchCrypto(query),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: QUERY_TIMINGS.search.staleTime,
    gcTime: QUERY_TIMINGS.search.gcTime,
    enabled: query.length > 0,
  });
};

export { SearchCryptoQueryOptions };
