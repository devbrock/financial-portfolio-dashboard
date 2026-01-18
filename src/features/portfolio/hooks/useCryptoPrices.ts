import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import type { SimplePriceParams } from "@functions/coinGeckoApi";

/**
 * Fetch crypto prices for multiple coin IDs
 */
export function useCryptoPrices(coinIds: string[]) {
  // CoinGecko supports batch requests, so we can fetch all coins in one call
  const params: SimplePriceParams = {
    ids: coinIds.join(","),
    vs_currencies: "usd",
    include_24hr_change: true,
    include_last_updated_at: true,
  };

  const { data, isLoading, isError, error } = useCryptoPrice(params);

  // Create map of coinId -> price
  const priceMap = new Map<string, number>();
  const changePctMap = new Map<string, number>();
  if (data) {
    Object.entries(data).forEach(([coinId, priceData]) => {
      priceMap.set(coinId, priceData.usd);
      if (typeof priceData.usd_24h_change === "number") {
        changePctMap.set(coinId, priceData.usd_24h_change);
      }
    });
  }

  return {
    priceMap,
    changePctMap,
    isLoading,
    isError,
    data,
    error: error ?? null,
  };
}
