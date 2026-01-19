import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';

export type GetCompanyProfileQueryKey = readonly ['companyProfile', string];

const getCompanyProfile = async (symbol: string) => {
  const { data } = await finnhubApi.getCompanyProfile(symbol);
  return data;
};

const GetCompanyProfileQueryOptions = (symbol: string) => {
  return queryOptions({
    queryKey: ['companyProfile', symbol] as GetCompanyProfileQueryKey,
    queryFn: () => getCompanyProfile(symbol),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Company profile data rarely changes, cache for 24 hours
    staleTime: 86400000, // 24 hours in milliseconds
    gcTime: 86400000, // Keep in cache for 24 hours
  });
};

export { GetCompanyProfileQueryOptions };
