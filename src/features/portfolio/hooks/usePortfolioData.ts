import { useMemo, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { initializePortfolio } from "../portfolioSlice";
import { usePortfolioHoldings } from "./usePortfolioHoldings";
import { useStockPrices } from "./useStockPrices";
import { useStockProfiles } from "./useStockProfiles";
import { useCryptoPrices } from "./useCryptoPrices";
import {
  enrichHoldingWithPrice,
  calculatePortfolioMetrics,
} from "@/utils/portfolioCalculations";
import type { HoldingWithPrice } from "@/types/portfolio";

/**
 * Main hook for orchestrating all portfolio data.
 * Combines Redux holdings with React Query market prices.
 */
export function usePortfolioData() {
  const dispatch = useAppDispatch();
  const holdings = usePortfolioHoldings();

  // Initialize portfolio on first load
  useEffect(() => {
    dispatch(initializePortfolio());
  }, [dispatch]);

  // Extract symbols by asset type
  const stockSymbols = useMemo(
    () =>
      holdings
        .filter((h) => h.assetType === "stock")
        .map((h) => h.symbol.toUpperCase()),
    [holdings]
  );

  const cryptoSymbols = useMemo(
    () =>
      holdings
        .filter((h) => h.assetType === "crypto")
        .map((h) => h.symbol.toLowerCase()),
    [holdings]
  );

  // Fetch stock data (prices and profiles)
  const {
    quoteMap,
    isLoading: stocksLoading,
    isError: stocksError,
    dataUpdatedAt: stockDataUpdatedAt,
  } = useStockPrices(stockSymbols);

  const {
    profileMap,
    isLoading: profilesLoading,
    isError: profilesError,
  } = useStockProfiles(stockSymbols);

  // Fetch crypto prices
  const {
    priceMap: cryptoPriceMap,
    isLoading: cryptoLoading,
    isError: cryptoError,
  } = useCryptoPrices(cryptoSymbols);

  // Get the latest data update timestamp
  const dataUpdatedAt = Math.max(stockDataUpdatedAt, 0);

  // Combine holdings with prices
  const holdingsWithPrice: HoldingWithPrice[] = useMemo(() => {
    return holdings.map((holding) => {
      const symbol =
        holding.assetType === "stock"
          ? holding.symbol.toUpperCase()
          : holding.symbol.toLowerCase();

      if (holding.assetType === "stock") {
        const quote = quoteMap.get(symbol);
        const profile = profileMap.get(symbol);
        const currentPrice = quote?.c || holding.purchasePrice;

        return enrichHoldingWithPrice(
          holding,
          currentPrice,
          profile?.name,
          profile?.logo
        );
      } else {
        // Crypto
        const currentPrice =
          cryptoPriceMap.get(symbol) || holding.purchasePrice;
        return enrichHoldingWithPrice(holding, currentPrice);
      }
    });
  }, [holdings, quoteMap, profileMap, cryptoPriceMap]);

  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    return calculatePortfolioMetrics(holdings, holdingsWithPrice);
  }, [holdings, holdingsWithPrice]);

  // Loading state
  const isLoading = stocksLoading || profilesLoading || cryptoLoading;
  const isError = stocksError || profilesError || cryptoError;

  return {
    holdings,
    holdingsWithPrice,
    metrics,
    isLoading,
    isError,
    hasHoldings: holdings.length > 0,
    dataUpdatedAt,
  };
}
