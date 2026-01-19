import { queryOptions } from '@tanstack/react-query';
import { coinGeckoApi, type MarketChartParams } from '@functions/coinGeckoApi';
import { ApiError } from '@/services/api/clients/apiError';

export type GetCryptoHistoricalDataQueryKey = readonly [
  'cryptoHistoricalData',
  string,
  MarketChartParams,
];

const getCryptoHistoricalData = async (coinId: string, params: MarketChartParams) => {
  const { data } = await coinGeckoApi.getMarketChart(coinId, params);
  return data;
};

const GetCryptoHistoricalDataQueryOptions = (coinId: string, params: MarketChartParams) => {
  return queryOptions({
    queryKey: ['cryptoHistoricalData', coinId, params] as GetCryptoHistoricalDataQueryKey,
    queryFn: () => getCryptoHistoricalData(coinId, params),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: Infinity, // Historical data never changes
    gcTime: Infinity, // Keep in cache indefinitely
  });
};

export { GetCryptoHistoricalDataQueryOptions };
