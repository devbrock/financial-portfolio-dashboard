import { queryOptions } from "@tanstack/react-query";
import {
  coinGeckoApi,
  type CoinDetailsParams,
} from "@functions/coinGeckoApi";
import type { CoinGeckoCoin } from "@/types/coinGecko";

export type GetCryptoCoinQueryKey = readonly [
  "cryptoCoin",
  string,
  CoinDetailsParams,
];

const getCryptoCoin = async (coinId: string, params: CoinDetailsParams) => {
  const { data } = await coinGeckoApi.getCoin(coinId, params);
  return data as CoinGeckoCoin;
};

const GetCryptoCoinQueryOptions = (
  coinId: string,
  params: CoinDetailsParams
) => {
  return queryOptions({
    queryKey: ["cryptoCoin", coinId, params] as GetCryptoCoinQueryKey,
    queryFn: () => getCryptoCoin(coinId, params),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export { GetCryptoCoinQueryOptions };
