import { useQuery } from '@tanstack/react-query';
import { GetMarketNewsQueryOptions } from '@/queryOptions/GetMarketNewsQueryOptions';
import { QUERY_TIMINGS } from '@/queryOptions/queryTimings';

export function useMarketNews(category = 'general') {
  const query = useQuery({
    ...GetMarketNewsQueryOptions(category),
    refetchInterval: QUERY_TIMINGS.hourly.refetchInterval,
    staleTime: QUERY_TIMINGS.hourly.staleTime,
    gcTime: QUERY_TIMINGS.hourly.gcTime,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
