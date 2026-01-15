import { queryOptions } from "@tanstack/react-query";
import { finhubApi } from "@functions/finhubApi";

export type GetStockQuoteQueryKey = readonly ["stockPrice", string];

const getStockQuote = async (symbol: string) => {
  const { data } = await finhubApi.getStockQuote(symbol);
  return data;
};

const GetStockQuoteQueryOptions = (symbol: string) => {
  return queryOptions({
    queryKey: ["stockPrice", symbol] as GetStockQuoteQueryKey,
    queryFn: () => getStockQuote(symbol),
  });
};

export { GetStockQuoteQueryOptions };
