import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';

export type GetMarketNewsQueryKey = readonly ['marketNews', string];

const getMarketNews = async (category: string) => {
  const { data } = await finnhubApi.getMarketNews(category);
  return data;
};

export const GetMarketNewsQueryOptions = (category = 'general') => {
  return queryOptions({
    queryKey: ['marketNews', category] as GetMarketNewsQueryKey,
    queryFn: () => getMarketNews(category),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 300000,
  });
};
