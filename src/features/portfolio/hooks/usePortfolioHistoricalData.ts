import { useCallback, useEffect, useMemo } from 'react';
import { useQueries, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { GetStockHistoricalDataQueryOptions } from '@/queryOptions/GetStockHistoricalDataQueryOptions';
import { GetCryptoHistoricalDataQueryOptions } from '@/queryOptions/GetCryptoHistoricalDataQueryOptions';
import { usePortfolioHoldings } from './usePortfolioHoldings';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setStockHistoricalCache } from '@/features/portfolio/portfolioSlice';
import type {
  AlphaVantageTimeSeriesDaily,
  AlphaVantageTimeSeriesMonthly,
} from '@/types/alphaVantage';
import { alphaVantageApi } from '@/services/api/functions/alphaVantageApi';
import {
  type HistoricalRange,
  RANGE_DAYS,
  buildDateRange,
  buildMonthlyDateRange,
  getStockSeries,
  parseStockSeries,
  parseCryptoSeries,
} from '../utils/historicalDataTransforms';

type StockSeries = AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly;
type StockQueryOptions = UseQueryOptions<StockSeries, Error, StockSeries, readonly unknown[]>;

const STOCK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * usePortfolioHistoricalData
 * Aggregates historical price series for the portfolio over the selected range.
 */
export function usePortfolioHistoricalData(range: HistoricalRange) {
  const holdings = usePortfolioHoldings();
  const dispatch = useAppDispatch();
  const stockCache = useAppSelector(state => state.portfolio.historicalCache?.stocks ?? {});
  const rangeDays = RANGE_DAYS[range];
  const useMonthly = range === '1y';
  const dateRange = useMemo(() => buildDateRange(rangeDays), [rangeDays]);
  const monthlyDateRange = useMemo(
    () => (useMonthly ? buildMonthlyDateRange() : dateRange),
    [dateRange, useMonthly]
  );
  const outputsize = 'compact';

  const stockHoldings = useMemo(
    () => holdings.filter(holding => holding.assetType === 'stock'),
    [holdings]
  );
  const cryptoHoldings = useMemo(
    () => holdings.filter(holding => holding.assetType === 'crypto'),
    [holdings]
  );
  const stockSymbols = useMemo(
    () => Array.from(new Set(stockHoldings.map(h => h.symbol.toUpperCase()))),
    [stockHoldings]
  );
  const cryptoSymbols = useMemo(
    () => Array.from(new Set(cryptoHoldings.map(h => h.symbol.toLowerCase()))),
    [cryptoHoldings]
  );

  const cryptoParams = useMemo(
    () => ({ vs_currency: 'usd', days: String(rangeDays) }),
    [rangeDays]
  );

  const cachedStockMeta = useMemo(() => {
    const now = Date.now();
    const meta = new Map<string, { data: StockSeries; isFresh: boolean; fetchedAt: number }>();
    stockSymbols.forEach(symbol => {
      const entry = stockCache[symbol];
      if (!entry) return;
      const isFresh = now - entry.fetchedAt < STOCK_CACHE_TTL_MS;
      if (isFresh) {
        meta.set(symbol, { data: entry.data, isFresh, fetchedAt: entry.fetchedAt });
      }
    });
    return meta;
  }, [stockCache, stockSymbols]);

  const stockQueries = useQueries({
    queries: stockSymbols.map(symbol => {
      const cached = cachedStockMeta.get(symbol);
      const baseOptions: StockQueryOptions = {
        queryKey: ['stockHistoricalMonthly', symbol] as const,
        queryFn: async () => (await alphaVantageApi.getTimeSeriesMonthly(symbol)).data,
        enabled: !cached?.isFresh,
        initialData: cached?.data,
        initialDataUpdatedAt: cached?.fetchedAt,
        staleTime: STOCK_CACHE_TTL_MS,
      };
      if (useMonthly) return baseOptions;

      const dailyOptions = GetStockHistoricalDataQueryOptions(symbol, outputsize);
      return {
        ...baseOptions,
        ...dailyOptions,
        queryFn: async () => (await alphaVantageApi.getTimeSeriesDaily(symbol, outputsize)).data,
      };
    }) as StockQueryOptions[],
  }) as UseQueryResult<StockSeries, Error>[];

  const cryptoQueries = useQueries({
    queries: cryptoSymbols.map(coinId => GetCryptoHistoricalDataQueryOptions(coinId, cryptoParams)),
  });

  const isLoading =
    stockQueries.some(q => q.isLoading) || cryptoQueries.some(q => q.isLoading);
  const hasMissingStockData = stockQueries.some((query, i) => {
    const fallback = cachedStockMeta.get(stockSymbols[i])?.data;
    const series = getStockSeries(query.data ?? fallback);
    return series ? !Object.keys(series).length : true;
  });
  const hasMissingCryptoData = cryptoQueries.some(q => q.data && !q.data.prices?.length);
  const hasMissingData = hasMissingStockData || hasMissingCryptoData;
  const isError =
    stockQueries.some(q => q.isError) || cryptoQueries.some(q => q.isError) || hasMissingData;
  const error =
    stockQueries.find(q => q.error)?.error ??
    cryptoQueries.find(q => q.error)?.error ??
    (hasMissingData ? new Error('Historical data is unavailable. Please try again soon.') : null);

  const historicalData = useMemo(() => {
    if (holdings.length === 0) return [];
    const targetRange = useMonthly ? monthlyDateRange : dateRange;
    if (targetRange.length === 0) return [];

    const stockSeriesMap = new Map<string, Map<string, number>>();
    stockQueries.forEach((q, i) => {
      const fallback = cachedStockMeta.get(stockSymbols[i])?.data;
      const data = q.data ?? fallback;
      if (data) stockSeriesMap.set(stockSymbols[i], parseStockSeries(data));
    });

    const cryptoSeriesMap = new Map<string, Map<string, number>>();
    cryptoQueries.forEach((q, i) => {
      if (q.data) cryptoSeriesMap.set(cryptoSymbols[i], parseCryptoSeries(q.data));
    });

    const entries = holdings.map(h => ({
      holding: h,
      priceEntries: Array.from(
        (h.assetType === 'stock'
          ? stockSeriesMap.get(h.symbol.toUpperCase())
          : cryptoSeriesMap.get(h.symbol.toLowerCase())) ?? []
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value })),
      cursor: 0,
      purchaseDate: h.purchaseDate.slice(0, 10),
      lastPrice: undefined as number | undefined,
    }));

    return targetRange.map(date => {
      let totalValue = 0;
      entries.forEach(e => {
        if (date < e.purchaseDate) return;
        while (e.cursor < e.priceEntries.length && e.priceEntries[e.cursor].date <= date) {
          e.lastPrice = e.priceEntries[e.cursor].value;
          e.cursor += 1;
        }
        if (e.lastPrice !== undefined) totalValue += e.lastPrice * e.holding.quantity;
      });
      return { date, value: totalValue };
    });
  }, [holdings, dateRange, monthlyDateRange, stockQueries, cryptoQueries, stockSymbols, cryptoSymbols, cachedStockMeta, useMonthly]);

  const refetch = useCallback(() => {
    void Promise.all([...stockQueries, ...cryptoQueries].map(q => q.refetch()));
  }, [stockQueries, cryptoQueries]);

  useEffect(() => {
    stockQueries.forEach((q, i) => {
      const symbol = stockSymbols[i];
      const cached = cachedStockMeta.get(symbol);
      const fetchedAt = q.dataUpdatedAt || Date.now();
      if (!q.data || (cached && cached.fetchedAt >= fetchedAt)) return;
      dispatch(setStockHistoricalCache({ symbol, entry: { data: q.data, outputsize, fetchedAt } }));
    });
  }, [cachedStockMeta, dispatch, outputsize, stockQueries, stockSymbols]);

  return { data: historicalData, isLoading, isError, error, refetch };
}
