import { useCallback, useEffect, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { GetStockHistoricalDataQueryOptions } from '@/queryOptions/GetStockHistoricalDataQueryOptions';
import { GetCryptoHistoricalDataQueryOptions } from '@/queryOptions/GetCryptoHistoricalDataQueryOptions';
import { usePortfolioHoldings } from './usePortfolioHoldings';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setStockHistoricalCache } from '@/features/portfolio/portfolioSlice';
import type { AlphaVantageTimeSeriesDaily, AlphaVantageTimeSeriesMonthly } from '@/types/alphaVantage';
import type { CoinGeckoMarketChart } from '@/types/coinGecko';
import { alphaVantageApi } from '@/services/api/functions/alphaVantageApi';

type Range = '7d' | '30d' | '90d' | '1y';

const RANGE_DAYS: Record<Range, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

const STOCK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildDateRange = (days: number) => {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const next = new Date(end);
    next.setUTCDate(end.getUTCDate() - offset);
    dates.push(toDateKey(next));
  }
  return dates;
};

const parseStockSeries = (data?: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly) => {
  const series = data?.['Time Series (Daily)'] ?? data?.['Time Series (Monthly)'];
  const map = new Map<string, number>();
  if (!series) return map;

  Object.entries(series).forEach(([date, daily]) => {
    const close = Number(daily['4. close']);
    if (!Number.isNaN(close)) {
      map.set(date, close);
    }
  });

  return map;
};

const parseCryptoSeries = (data?: CoinGeckoMarketChart) => {
  const map = new Map<string, number>();
  if (!data?.prices?.length) return map;

  data.prices.forEach(([timestamp, price]) => {
    const date = toDateKey(new Date(timestamp));
    map.set(date, price);
  });

  return map;
};

export function usePortfolioHistoricalData(range: Range) {
  const holdings = usePortfolioHoldings();
  const dispatch = useAppDispatch();
  const stockCache = useAppSelector(state => state.portfolio.historicalCache?.stocks ?? {});
  const rangeDays = RANGE_DAYS[range];
  const useMonthly = range === '1y';
  const dateRange = useMemo(() => buildDateRange(rangeDays), [rangeDays]);
  const monthlyDateRange = useMemo(() => {
    if (!useMonthly) return dateRange;
    const end = new Date();
    end.setUTCDate(1);
    end.setUTCHours(0, 0, 0, 0);
    const dates: string[] = [];
    for (let offset = 11; offset >= 0; offset -= 1) {
      const next = new Date(end);
      next.setUTCMonth(end.getUTCMonth() - offset);
      dates.push(toDateKey(next));
    }
    return dates;
  }, [dateRange, useMonthly]);
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
    () => Array.from(new Set(stockHoldings.map(holding => holding.symbol.toUpperCase()))),
    [stockHoldings]
  );
  const cryptoSymbols = useMemo(
    () => Array.from(new Set(cryptoHoldings.map(holding => holding.symbol.toLowerCase()))),
    [cryptoHoldings]
  );

  const cryptoParams = useMemo(
    () => ({
      vs_currency: 'usd',
      days: String(rangeDays),
    }),
    [rangeDays]
  );

  const cachedStockMeta = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const meta = new Map<
      string,
      { data: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly; isFresh: boolean; fetchedAt: number }
    >();
    stockSymbols.forEach(symbol => {
      const entry = stockCache[symbol];
      if (!entry) return;
      const age = now - entry.fetchedAt;
      const isFresh = age < STOCK_CACHE_TTL_MS;
      if (isFresh) {
        meta.set(symbol, {
          data: entry.data,
          isFresh,
          fetchedAt: entry.fetchedAt,
        });
      }
    });
    return meta;
  }, [stockCache, stockSymbols]);

  const stockQueries = useQueries({
    queries: stockSymbols.map(symbol => {
      const cached = cachedStockMeta.get(symbol);
      if (useMonthly) {
        return {
          queryKey: ['stockHistoricalMonthly', symbol] as const,
          queryFn: async () => {
            const response = await alphaVantageApi.getTimeSeriesMonthly(symbol);
            return response.data;
          },
          enabled: !cached?.isFresh,
          initialData: cached?.data,
          initialDataUpdatedAt: cached?.fetchedAt,
          staleTime: STOCK_CACHE_TTL_MS,
        };
      }

      const baseOptions = GetStockHistoricalDataQueryOptions(symbol, outputsize);
      return {
        ...baseOptions,
        enabled: !cached?.isFresh,
        initialData: cached?.data,
        initialDataUpdatedAt: cached?.fetchedAt,
      };
    }),
  });
  const cryptoQueries = useQueries({
    queries: cryptoSymbols.map(coinId => GetCryptoHistoricalDataQueryOptions(coinId, cryptoParams)),
  });

  const isLoading =
    stockQueries.some(query => query.isLoading) || cryptoQueries.some(query => query.isLoading);
  const hasMissingStockData = stockQueries.some((query, index) => {
    const symbol = stockSymbols[index];
    const fallback = cachedStockMeta.get(symbol)?.data;
    const data = query.data ?? fallback;
    return data
      ? !data['Time Series (Daily)'] && !data['Time Series (Monthly)']
      : true;
  });
  const hasMissingCryptoData = cryptoQueries.some(
    query => query.data && !query.data.prices?.length
  );
  const hasMissingData = hasMissingStockData || hasMissingCryptoData;

  const isError =
    stockQueries.some(query => query.isError) ||
    cryptoQueries.some(query => query.isError) ||
    hasMissingData;
  const error =
    stockQueries.find(query => query.error)?.error ??
    cryptoQueries.find(query => query.error)?.error ??
    (hasMissingData ? new Error('Historical data is unavailable. Please try again soon.') : null);

  const historicalData = useMemo(() => {
    if (holdings.length === 0) return [];
    const targetRange = useMonthly ? monthlyDateRange : dateRange;
    if (targetRange.length === 0) return [];

    const stockSeriesBySymbol = new Map<string, Map<string, number>>();
    stockQueries.forEach((query, index) => {
      const symbol = stockSymbols[index];
      const fallback = cachedStockMeta.get(symbol)?.data;
      const data = query.data ?? fallback;
      if (!data) return;
      stockSeriesBySymbol.set(symbol, parseStockSeries(data));
    });

    const cryptoSeriesBySymbol = new Map<string, Map<string, number>>();
    cryptoQueries.forEach((query, index) => {
      if (!query.data) return;
      const symbol = cryptoSymbols[index];
      cryptoSeriesBySymbol.set(symbol, parseCryptoSeries(query.data));
    });

    const holdingEntries = holdings.map(holding => {
      const symbol =
        holding.assetType === 'stock' ? holding.symbol.toUpperCase() : holding.symbol.toLowerCase();
      const priceMap =
        holding.assetType === 'stock'
          ? stockSeriesBySymbol.get(symbol)
          : cryptoSeriesBySymbol.get(symbol);
      return {
        holding,
        priceMap: priceMap ?? new Map<string, number>(),
        purchaseDate: holding.purchaseDate.slice(0, 10),
        lastPrice: undefined as number | undefined,
      };
    });

    return targetRange.map(date => {
      let totalValue = 0;

      holdingEntries.forEach(entry => {
        if (date < entry.purchaseDate) return;
        const price = entry.priceMap.get(date);
        if (typeof price === 'number') {
          entry.lastPrice = price;
        }
        if (entry.lastPrice !== undefined) {
          totalValue += entry.lastPrice * entry.holding.quantity;
        }
      });

      return { date, value: totalValue };
    });
  }, [
    holdings,
    dateRange,
    monthlyDateRange,
    stockQueries,
    cryptoQueries,
    stockSymbols,
    cryptoSymbols,
    cachedStockMeta,
    useMonthly,
  ]);

  const refetch = useCallback(() => {
    void Promise.all([...stockQueries, ...cryptoQueries].map(query => query.refetch()));
  }, [stockQueries, cryptoQueries]);

  useEffect(() => {
    stockQueries.forEach((query, index) => {
      const symbol = stockSymbols[index];
      const cached = cachedStockMeta.get(symbol);
      const fetchedAt = query.dataUpdatedAt || Date.now();
      if (!query.data) return;
      if (cached && cached.fetchedAt >= fetchedAt) return;
      dispatch(
        setStockHistoricalCache({
          symbol,
          entry: {
            data: query.data,
            outputsize,
            fetchedAt,
          },
        })
      );
    });
  }, [cachedStockMeta, dispatch, outputsize, stockQueries, stockSymbols]);

  return {
    data: historicalData,
    isLoading,
    isError,
    error,
    refetch,
  };
}
