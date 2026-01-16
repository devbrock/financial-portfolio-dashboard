import { useQuery } from "@tanstack/react-query";
import { SearchSymbolQueryOptions } from "@/queryOptions/SearchSymbolQueryOptions";

export const useSymbolSearch = (query: string, exchange?: string) => {
  return useQuery(SearchSymbolQueryOptions(query, exchange));
};
