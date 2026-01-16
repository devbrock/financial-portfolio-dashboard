import { queryOptions } from "@tanstack/react-query";
import { coinGeckoApi } from "@functions/coinGeckoApi";

export type SearchCryptoQueryKey = readonly ["cryptoSearch", string];

const searchCrypto = async (query: string) => {
  const { data } = await coinGeckoApi.searchCoins(query);
  return data;
};

const SearchCryptoQueryOptions = (query: string) => {
  return queryOptions({
    queryKey: ["cryptoSearch", query] as SearchCryptoQueryKey,
    queryFn: () => searchCrypto(query),
    staleTime: 300000,
    gcTime: 600000,
    enabled: query.length > 0,
  });
};

export { SearchCryptoQueryOptions };
