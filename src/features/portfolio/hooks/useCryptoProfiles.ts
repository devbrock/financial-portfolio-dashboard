import { useQueries } from "@tanstack/react-query";
import { GetCryptoCoinQueryOptions } from "@/queryOptions/GetCryptoCoinQueryOptions";
import type { CoinGeckoCoin } from "@/types/coinGecko";

const COIN_DETAILS_PARAMS = {
  localization: false,
  tickers: false,
  market_data: false,
  community_data: false,
  developer_data: false,
  sparkline: false,
};

/**
 * Fetch coin details for multiple coin IDs in parallel
 */
export function useCryptoProfiles(coinIds: string[]) {
  const queries = useQueries({
    queries: coinIds.map((coinId) =>
      GetCryptoCoinQueryOptions(coinId, COIN_DETAILS_PARAMS)
    ),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  const profileMap = new Map<string, CoinGeckoCoin>();
  queries.forEach((query, index) => {
    if (query.data) {
      profileMap.set(coinIds[index], query.data);
    }
  });

  return {
    profileMap,
    isLoading,
    isError,
    queries,
  };
}
