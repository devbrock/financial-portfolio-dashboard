import type { AlphaVantageTimeSeriesDaily } from "@/types/alphaVantage";
import { alphaVantageClient } from "@/services/api/clients/alphaVantageClient";

/* Type-safe API functions */
export const alphaVantageApi = {
  getTimeSeriesDaily: async (
    symbol: string,
    outputsize: "compact" | "full" = "compact"
  ) => {
    return alphaVantageClient.get<AlphaVantageTimeSeriesDaily>("", {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol,
        outputsize,
      },
    });
  },
};
