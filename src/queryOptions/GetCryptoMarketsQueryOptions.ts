import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type CoinMarketsParams } from '@functions/coinGeckoApi';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

export type GetCryptoMarketsQueryKey = readonly ['cryptoMarkets', CoinMarketsParams];

const getCryptoMarkets = async (params: CoinMarketsParams) => {
  const { data } = await coinGeckoApi.getMarkets(params);
  return data;
};

const GetCryptoMarketsQueryOptions = (params: CoinMarketsParams) => {
  return queryOptions({
    queryKey: ['cryptoMarkets', params] as GetCryptoMarketsQueryKey,
    queryFn: () => getCryptoMarkets(params),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: QUERY_TIMINGS.daily.staleTime,
    gcTime: QUERY_TIMINGS.daily.gcTime,
  });
};

export { GetCryptoMarketsQueryOptions };
