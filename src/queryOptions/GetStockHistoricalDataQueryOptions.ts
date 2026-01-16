import { queryOptions } from "@tanstack/react-query";
import { alphaVantageApi } from "@functions/alphaVantageApi";

export type GetStockHistoricalDataQueryKey = readonly [
  "stockHistoricalData",
  string,
  "compact" | "full"
];

const getStockHistoricalData = async (
  symbol: string,
  outputsize: "compact" | "full" = "compact"
) => {
  const { data } = await alphaVantageApi.getTimeSeriesDaily(symbol, outputsize);
  return data;
};

const GetStockHistoricalDataQueryOptions = (
  symbol: string,
  outputsize: "compact" | "full" = "compact"
) => {
  return queryOptions({
    queryKey: [
      "stockHistoricalData",
      symbol,
      outputsize,
    ] as GetStockHistoricalDataQueryKey,
    queryFn: () => getStockHistoricalData(symbol, outputsize),
    staleTime: Infinity, // Historical data never changes
    gcTime: Infinity, // Keep in cache indefinitely
  });
};

export { GetStockHistoricalDataQueryOptions };
