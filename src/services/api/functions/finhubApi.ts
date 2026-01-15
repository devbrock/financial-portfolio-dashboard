import type { FinhubStockQuote } from "@/types/finhub";
import { finhubClient } from "@clients/finhubClient";

/* Type-safe API functions */
export const finhubApi = {
  getStockQuote: async (symbol: string) => {
    return finhubClient.get<FinhubStockQuote>("/quote", { params: { symbol } });
  },
};
