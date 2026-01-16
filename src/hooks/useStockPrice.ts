import { useQuery } from "@tanstack/react-query";
import { GetStockQuoteQueryOptions } from "@/queryOptions/GetStockQuoteQueryOptions";

export const useStockPrice = (symbol: string) => {
  return useQuery(GetStockQuoteQueryOptions(symbol));
};
