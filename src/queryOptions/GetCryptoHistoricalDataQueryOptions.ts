import { queryOptions } from "@tanstack/react-query";
import {
  coinGeckoApi,
  type MarketChartParams,
} from "@functions/coinGeckoApi";

export type GetCryptoHistoricalDataQueryKey = readonly [
  "cryptoHistoricalData",
  string,
  MarketChartParams
];

const getCryptoHistoricalData = async (
  coinId: string,
  params: MarketChartParams
) => {
  const { data } = await coinGeckoApi.getMarketChart(coinId, params);
  return data;
};

const GetCryptoHistoricalDataQueryOptions = (
  coinId: string,
  params: MarketChartParams
) => {
  return queryOptions({
    queryKey: [
      "cryptoHistoricalData",
      coinId,
      params,
    ] as GetCryptoHistoricalDataQueryKey,
    queryFn: () => getCryptoHistoricalData(coinId, params),
    staleTime: Infinity, // Historical data never changes
    gcTime: Infinity, // Keep in cache indefinitely
  });
};

export { GetCryptoHistoricalDataQueryOptions };
