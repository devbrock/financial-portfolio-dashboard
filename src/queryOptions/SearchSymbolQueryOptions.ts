import { queryOptions } from "@tanstack/react-query";
import { finnhubApi } from "@/services/api/functions/finnhubApi";

export type SearchSymbolQueryKey = readonly [
  "symbolSearch",
  string,
  string | undefined,
];

const searchSymbol = async (query: string, exchange?: string) => {
  const { data } = await finnhubApi.searchSymbol(query, exchange);
  return data;
};

const SearchSymbolQueryOptions = (query: string, exchange?: string) => {
  return queryOptions({
    queryKey: ["symbolSearch", query, exchange] as SearchSymbolQueryKey,
    queryFn: () => searchSymbol(query, exchange),
    // Symbol search is user-triggered and results are relatively stable
    // Cache for 5 minutes to reduce API calls during form interaction
    staleTime: 300000, // 5 minutes in milliseconds
    gcTime: 600000, // Keep in cache for 10 minutes
    // Don't fetch automatically - only when user types
    enabled: query.length > 0,
  });
};

export { SearchSymbolQueryOptions };
