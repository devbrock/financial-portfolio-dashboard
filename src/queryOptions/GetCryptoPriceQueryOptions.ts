import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type SimplePriceParams } from '@functions/coinGeckoApi';
import { ApiError } from '@/services/api/clients/apiError';

export type GetCryptoPriceQueryKey = readonly ['cryptoPrice', SimplePriceParams];

const getCryptoPrice = async (params: SimplePriceParams) => {
  const { data } = await coinGeckoApi.getSimplePrice(params);
  return data;
};

const GetCryptoPriceQueryOptions = (params: SimplePriceParams) => {
  return queryOptions({
    queryKey: ['cryptoPrice', params] as GetCryptoPriceQueryKey,
    queryFn: () => getCryptoPrice(params),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 50000, // 50 seconds
    gcTime: 60000, // 60 seconds
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });
};

export { GetCryptoPriceQueryOptions };
