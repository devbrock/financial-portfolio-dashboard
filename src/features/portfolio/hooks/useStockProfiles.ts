import { useQueries } from "@tanstack/react-query";
import { GetCompanyProfileQueryOptions } from "@/queryOptions/GetCompanyProfileQueryOptions";
import type { FinnhubCompanyProfile } from "@/types/finnhub";

/**
 * Fetch company profiles for multiple symbols in parallel
 */
export function useStockProfiles(symbols: string[]) {
  const queries = useQueries({
    queries: symbols.map((symbol) => GetCompanyProfileQueryOptions(symbol)),
  });

  // Extract data and loading states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const error = queries.find((query) => query.error)?.error ?? null;

  // Create map of symbol -> profile data
  const profileMap = new Map<string, FinnhubCompanyProfile>();
  queries.forEach((query, index) => {
    if (query.data) {
      profileMap.set(symbols[index], query.data);
    }
  });

  return {
    profileMap,
    isLoading,
    isError,
    queries,
    error,
  };
}
