import { useQuery } from '@tanstack/react-query';
import { GetMarketNewsQueryOptions } from '@/queryOptions/GetMarketNewsQueryOptions';

export function useMarketNews(category = 'general') {
  const query = useQuery({
    ...GetMarketNewsQueryOptions(category),
    refetchInterval: 60 * 60 * 1000,
    staleTime: 55 * 60 * 1000,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
}
