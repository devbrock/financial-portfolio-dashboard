import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type SimplePriceParams } from '@functions/coinGeckoApi';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

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
    staleTime: QUERY_TIMINGS.realtime.staleTime,
    gcTime: QUERY_TIMINGS.realtime.gcTime,
    refetchInterval: QUERY_TIMINGS.realtime.refetchInterval,
  });
};

export { GetCryptoPriceQueryOptions };
