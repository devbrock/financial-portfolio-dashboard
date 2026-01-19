import { useQuery } from '@tanstack/react-query';
import { GetCryptoHistoricalDataQueryOptions } from '@/queryOptions/GetCryptoHistoricalDataQueryOptions';
import type { MarketChartParams } from '@functions/coinGeckoApi';

export const useCryptoHistoricalData = (coinId: string, params: MarketChartParams) => {
  return useQuery(GetCryptoHistoricalDataQueryOptions(coinId, params));
};
