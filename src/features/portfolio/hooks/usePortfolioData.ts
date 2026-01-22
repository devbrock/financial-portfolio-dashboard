import { useMemo, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initializePortfolio } from '../portfolioSlice';
import { usePortfolioHoldings } from './usePortfolioHoldings';
import { usePortfolioWatchlist } from './usePortfolioWatchlist';
import { useStockPrices } from './useStockPrices';
import { useStockProfiles } from './useStockProfiles';
import { useCryptoPrices } from './useCryptoPrices';
import { useCryptoProfiles } from './useCryptoProfiles';
import { enrichHoldingWithPrice, calculatePortfolioMetrics } from '@/utils/portfolioCalculations';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { getOptimizedImageUrl } from '@/utils/getOptimizedImageUrl';
import type { HoldingWithPrice, WatchlistItemWithPrice } from '@/types/portfolio';

/**
 * Main hook for orchestrating all portfolio data.
 * Combines Redux holdings with React Query market prices.
 */
export function usePortfolioData() {
  const dispatch = useAppDispatch();
  const holdings = usePortfolioHoldings();
  const watchlist = usePortfolioWatchlist();

  // Initialize portfolio on first load
  useEffect(() => {
    dispatch(initializePortfolio());
  }, [dispatch]);

  // Extract symbols by asset type
  const stockSymbols = useMemo(() => {
    const symbols = [
      ...holdings.filter(h => h.assetType === 'stock').map(h => h.symbol.toUpperCase()),
      ...watchlist.filter(w => w.assetType === 'stock').map(w => w.symbol.toUpperCase()),
    ];
    return Array.from(new Set(symbols));
  }, [holdings, watchlist]);

  const cryptoSymbols = useMemo(() => {
    const symbols = [
      ...holdings.filter(h => h.assetType === 'crypto').map(h => h.symbol.toLowerCase()),
      ...watchlist.filter(w => w.assetType === 'crypto').map(w => w.symbol.toLowerCase()),
    ];
    return Array.from(new Set(symbols));
  }, [holdings, watchlist]);

  // Fetch stock data (prices and profiles)
  const {
    quoteMap,
    isLoading: stocksLoading,
    isError: stocksError,
    dataUpdatedAt: stockDataUpdatedAt,
    error: stocksErrorObj,
  } = useStockPrices(stockSymbols);

  const {
    profileMap,
    isLoading: profilesLoading,
    isError: profilesError,
    error: profilesErrorObj,
  } = useStockProfiles(stockSymbols);

  // Fetch crypto prices
  const {
    priceMap: cryptoPriceMap,
    changePctMap: cryptoChangePctMap,
    isLoading: cryptoLoading,
    isError: cryptoError,
    error: cryptoErrorObj,
  } = useCryptoPrices(cryptoSymbols);

  const {
    profileMap: cryptoProfileMap,
    isLoading: cryptoProfilesLoading,
    isError: cryptoProfilesError,
    error: cryptoProfilesErrorObj,
  } = useCryptoProfiles(cryptoSymbols);

  // Get the latest data update timestamp
  const dataUpdatedAt = Math.max(stockDataUpdatedAt, 0);

  // Combine holdings with prices
  const holdingsWithPrice: HoldingWithPrice[] = useMemo(() => {
    return holdings.map(holding => {
      const symbol =
        holding.assetType === 'stock' ? holding.symbol.toUpperCase() : holding.symbol.toLowerCase();

      if (holding.assetType === 'stock') {
        const quote = quoteMap.get(symbol);
        const profile = profileMap.get(symbol);
        const currentPrice = quote?.c || holding.purchasePrice;

        const logo = getOptimizedImageUrl(profile?.logo);
        return enrichHoldingWithPrice(holding, currentPrice, profile?.name, logo);
      } else {
        // Crypto
        const currentPrice = cryptoPriceMap.get(symbol) || holding.purchasePrice;
        const profile = cryptoProfileMap.get(symbol);
        const logoSource = profile?.image?.small || profile?.image?.thumb || profile?.image?.large;
        const logo = getOptimizedImageUrl(logoSource);
        return enrichHoldingWithPrice(holding, currentPrice, profile?.name, logo);
      }
    });
  }, [holdings, quoteMap, profileMap, cryptoPriceMap, cryptoProfileMap]);

  const watchlistWithPrice: WatchlistItemWithPrice[] = useMemo(() => {
    return watchlist.map(item => {
      const symbol =
        item.assetType === 'stock' ? item.symbol.toUpperCase() : item.symbol.toLowerCase();

      if (item.assetType === 'stock') {
        const quote = quoteMap.get(symbol);
        const profile = profileMap.get(symbol);
        return {
          ...item,
          currentPrice: quote?.c ?? 0,
          changePct: quote?.dp ?? 0,
          companyName: profile?.name,
          logo: getOptimizedImageUrl(profile?.logo),
        };
      }

      const profile = cryptoProfileMap.get(symbol);
      const logoSource = profile?.image?.small || profile?.image?.thumb || profile?.image?.large;
      const logo = getOptimizedImageUrl(logoSource);

      return {
        ...item,
        currentPrice: cryptoPriceMap.get(symbol) ?? 0,
        changePct: cryptoChangePctMap.get(symbol) ?? 0,
        companyName: profile?.name,
        logo,
      };
    });
  }, [watchlist, quoteMap, profileMap, cryptoPriceMap, cryptoChangePctMap, cryptoProfileMap]);

  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    return calculatePortfolioMetrics(holdings, holdingsWithPrice);
  }, [holdings, holdingsWithPrice]);

  // Loading state
  const isLoading = stocksLoading || profilesLoading || cryptoLoading || cryptoProfilesLoading;
  const isError = stocksError || profilesError || cryptoError || cryptoProfilesError;
  const firstError =
    stocksErrorObj || profilesErrorObj || cryptoErrorObj || cryptoProfilesErrorObj || null;
  const errorMessage = getErrorMessage(firstError, "We couldn't load your latest market data.");

  return {
    holdings,
    holdingsWithPrice,
    watchlist,
    watchlistWithPrice,
    metrics,
    isLoading,
    isError,
    errorMessage,
    hasHoldings: holdings.length > 0,
    dataUpdatedAt,
  };
}
