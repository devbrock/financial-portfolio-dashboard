import type {
  AlphaVantageTimeSeriesDaily,
  AlphaVantageTimeSeriesMonthly,
} from '@/types/alphaVantage';
import type { CoinGeckoMarketChart } from '@/types/coinGecko';

/**
 * Converts a Date to an ISO date key (YYYY-MM-DD).
 */
export const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Builds an array of date keys for a given number of days ending today.
 */
export const buildDateRange = (days: number): string[] => {
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

/**
 * Builds an array of monthly date keys for the past 12 months.
 */
export const buildMonthlyDateRange = (): string[] => {
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
};

/**
 * Type guard for daily series data.
 */
export const isDailySeries = (
  data: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly
): data is AlphaVantageTimeSeriesDaily => 'Time Series (Daily)' in data;

/**
 * Type guard for monthly series data.
 */
export const isMonthlySeries = (
  data: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly
): data is AlphaVantageTimeSeriesMonthly => 'Time Series (Monthly)' in data;

/**
 * Extracts the time series object from Alpha Vantage data.
 */
export const getStockSeries = (
  data?: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly
): Record<string, { '4. close': string }> | null => {
  if (!data) return null;
  if (isDailySeries(data)) return data['Time Series (Daily)'];
  if (isMonthlySeries(data)) return data['Time Series (Monthly)'];
  return null;
};

/**
 * Parses Alpha Vantage series data into a Map of date → closing price.
 */
export const parseStockSeries = (
  data?: AlphaVantageTimeSeriesDaily | AlphaVantageTimeSeriesMonthly
): Map<string, number> => {
  const series = getStockSeries(data);
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

/**
 * Parses CoinGecko market chart data into a Map of date → price.
 */
export const parseCryptoSeries = (data?: CoinGeckoMarketChart): Map<string, number> => {
  const map = new Map<string, number>();
  if (!data?.prices?.length) return map;

  data.prices.forEach(([timestamp, price]) => {
    const date = toDateKey(new Date(timestamp));
    map.set(date, price);
  });

  return map;
};

/** Range option type. */
export type HistoricalRange = '7d' | '30d' | '90d' | '1y';

/** Maps range to number of days. */
export const RANGE_DAYS: Record<HistoricalRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

