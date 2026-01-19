import { queryOptions } from "@tanstack/react-query";
import { alphaVantageApi } from "@functions/alphaVantageApi";
import { ApiError } from "@/services/api/clients/apiError";

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
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: Infinity, // Historical data never changes
    gcTime: Infinity, // Keep in cache indefinitely
  });
};

export { GetStockHistoricalDataQueryOptions };
