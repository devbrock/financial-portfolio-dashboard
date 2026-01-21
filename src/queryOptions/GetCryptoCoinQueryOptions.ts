import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type CoinDetailsParams } from '@functions/coinGeckoApi';
import type { CoinGeckoCoin } from '@/types/coinGecko';
import { ApiError } from '@/services/api/clients/apiError';
import { QUERY_TIMINGS } from './queryTimings';

export type GetCryptoCoinQueryKey = readonly ['cryptoCoin', string, CoinDetailsParams];

const getCryptoCoin = async (coinId: string, params: CoinDetailsParams) => {
  const { data } = await coinGeckoApi.getCoin(coinId, params);
  return data as CoinGeckoCoin;
};

const GetCryptoCoinQueryOptions = (coinId: string, params: CoinDetailsParams) => {
  return queryOptions({
    queryKey: ['cryptoCoin', coinId, params] as GetCryptoCoinQueryKey,
    queryFn: () => getCryptoCoin(coinId, params),
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

export { GetCryptoCoinQueryOptions };
