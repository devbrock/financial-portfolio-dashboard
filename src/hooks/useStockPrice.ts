import { useQuery } from "@tanstack/react-query";
import { GetStockQuoteQueryOptions } from "@/queries/GetStockQuoteQuery";

export const useStockPrice = (symbol: string) => {
  return useQuery(GetStockQuoteQueryOptions(symbol));
};
