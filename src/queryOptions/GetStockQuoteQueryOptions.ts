import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

export type GetStockQuoteQueryKey = readonly ['stockPrice', string];

const getStockQuote = async (symbol: string) => {
  const { data } = await finnhubApi.getStockQuote(symbol);
  return data;
};

const GetStockQuoteQueryOptions = (symbol: string) => {
  return queryOptions({
    queryKey: ['stockPrice', symbol] as GetStockQuoteQueryKey,
    queryFn: () => getStockQuote(symbol),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: QUERY_TIMINGS.realtime.refetchInterval,
    staleTime: QUERY_TIMINGS.realtime.staleTime,
    gcTime: QUERY_TIMINGS.realtime.gcTime,
  });
};

export { GetStockQuoteQueryOptions };
