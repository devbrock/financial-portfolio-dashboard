import { queryOptions } from "@tanstack/react-query";
import { finnhubApi } from "@/services/api/functions/finnhubApi";

export type GetStockQuoteQueryKey = readonly ["stockPrice", string];

const getStockQuote = async (symbol: string) => {
  const { data } = await finnhubApi.getStockQuote(symbol);
  return data;
};

const GetStockQuoteQueryOptions = (symbol: string) => {
  return queryOptions({
    queryKey: ["stockPrice", symbol] as GetStockQuoteQueryKey,
    queryFn: () => getStockQuote(symbol),
    refetchInterval: 60000,
    staleTime: 50000,
  });
};

export { GetStockQuoteQueryOptions };
