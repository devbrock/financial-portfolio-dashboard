import { useMemo, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { initializePortfolio } from "../portfolioSlice";
import { usePortfolioHoldings } from "./usePortfolioHoldings";
import { useStockPrices } from "./useStockPrices";
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

  // Fetch prices
  const {
    priceMap: stockPriceMap,
    isLoading: stocksLoading,
    isError: stocksError,
  } = useStockPrices(stockSymbols);

  const {
    priceMap: cryptoPriceMap,
    isLoading: cryptoLoading,
    isError: cryptoError,
  } = useCryptoPrices(cryptoSymbols);

  // Combine holdings with prices
  const holdingsWithPrice: HoldingWithPrice[] = useMemo(() => {
    return holdings.map((holding) => {
      const priceMap =
        holding.assetType === "stock" ? stockPriceMap : cryptoPriceMap;
      const symbol =
        holding.assetType === "stock"
          ? holding.symbol.toUpperCase()
          : holding.symbol.toLowerCase();
      const currentPrice = priceMap.get(symbol) || holding.purchasePrice;

      return enrichHoldingWithPrice(holding, currentPrice);
    });
  }, [holdings, stockPriceMap, cryptoPriceMap]);

  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    return calculatePortfolioMetrics(holdings, holdingsWithPrice);
  }, [holdings, holdingsWithPrice]);

  // Loading state
  const isLoading = stocksLoading || cryptoLoading;
  const isError = stocksError || cryptoError;

  return {
    holdings,
    holdingsWithPrice,
    metrics,
    isLoading,
    isError,
    hasHoldings: holdings.length > 0,
  };
}
