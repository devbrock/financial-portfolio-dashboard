import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

export type GetCompanyNewsQueryKey = readonly ['companyNews', string, string, string];

const getCompanyNews = async (symbol: string, from: string, to: string) => {
  const { data } = await finnhubApi.getCompanyNews(symbol, from, to);
  return data;
};

export const GetCompanyNewsQueryOptions = (symbol: string, from: string, to: string) => {
  return queryOptions({
    queryKey: ['companyNews', symbol, from, to] as GetCompanyNewsQueryKey,
    queryFn: () => getCompanyNews(symbol, from, to),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: QUERY_TIMINGS.search.staleTime,
    gcTime: QUERY_TIMINGS.search.gcTime,
  });
};
