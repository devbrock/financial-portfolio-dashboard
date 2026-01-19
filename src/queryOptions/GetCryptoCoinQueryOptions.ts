import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type CoinDetailsParams } from '@functions/coinGeckoApi';
import type { CoinGeckoCoin } from '@/types/coinGecko';
import { ApiError } from '@/services/api/clients/apiError';

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
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export { GetCryptoCoinQueryOptions };
