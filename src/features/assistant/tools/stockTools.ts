import type { AlphaVantageTimeSeriesDaily } from '@/types/alphaVantage';
import type { HoldingWithPrice, WatchlistItemWithPrice } from '@/types/portfolio';
import { alphaVantageApi } from '@/services/api/functions/alphaVantageApi';
import { formatCurrency, formatPct, toDateKey } from './formatters';
import { wantsWeeklyMovement } from './questionAnalysis';

const STOCK_SERIES_TTL = 60 * 60 * 1000;

const stockSeriesCache = new Map<
  string,
  { data: AlphaVantageTimeSeriesDaily; fetchedAt: number }
>();
const stockWeekCache = new Map<string, { summary: string; fetchedAt: number }>();

/**
 * Parses Alpha Vantage daily series into a Map of date → closing price.
 */
export const parseStockSeries = (data?: AlphaVantageTimeSeriesDaily): Map<string, number> => {
  const series = data?.['Time Series (Daily)'];
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
 * Gets the price on or before a target date from a price series.
 */
export const getPriceOnOrBefore = (series: Map<string, number>, target: Date): number | null => {
  const targetKey = toDateKey(target);
  const entries = Array.from(series.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const match = entries.find(([date]) => date <= targetKey);
  return match?.[1] ?? entries[entries.length - 1]?.[1] ?? null;
};

/**
 * Gets the latest price from a price series.
 */
export const getLatestPrice = (series: Map<string, number>): number | null => {
  const entries = Array.from(series.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  return entries[0]?.[1] ?? null;
};

/**
 * Fetches stock daily series with caching.
 */
export const getStockSeries = async (
  symbol: string,
  days: number
): Promise<AlphaVantageTimeSeriesDaily> => {
  const cached = stockSeriesCache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < STOCK_SERIES_TTL) {
    return cached.data;
  }
  const outputsize = days > 100 ? 'full' : 'compact';
  const response = await alphaVantageApi.getTimeSeriesDaily(symbol, outputsize);
  stockSeriesCache.set(symbol, { data: response.data, fetchedAt: Date.now() });
  return response.data;
};

/**
 * Extracts a stock symbol from a question by matching against known holdings/watchlist.
 */
export const extractStockSymbol = (
  question: string,
  holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[]
): string | null => {
  const normalized = question.toLowerCase();
  const knownSymbols = Array.from(
    new Set([
      ...holdings.map(holding => holding.symbol.toUpperCase()),
      ...watchlist.map(item => item.symbol.toUpperCase()),
    ])
  );

  const knownMatch = knownSymbols.find(symbol =>
    new RegExp(`\\b${symbol.toLowerCase()}\\b`, 'i').test(normalized)
  );
  if (knownMatch) return knownMatch;

  const rawMatch = question.match(/\b[A-Z]{1,5}\b/);
  return rawMatch?.[0] ?? null;
};

/**
 * Generates a weekly summary for a stock.
 */
export const getStockWeeklySummary = async (
  question: string,
  holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[]
): Promise<string | null> => {
  if (!wantsWeeklyMovement(question)) return null;

  const symbol = extractStockSymbol(question, holdings, watchlist);
  if (!symbol) return null;

  const cached = stockWeekCache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < STOCK_SERIES_TTL) {
    return cached.summary;
  }

  const seriesData = await getStockSeries(symbol, 30);
  const series = parseStockSeries(seriesData);
  if (series.size < 2) return null;

  const latestPrice = getLatestPrice(series);
  if (!latestPrice) return null;

  const target = new Date();
  target.setDate(target.getDate() - 7);
  const priorPrice = getPriceOnOrBefore(series, target);
  if (!priorPrice || priorPrice === 0) return null;

  const changePct = ((latestPrice - priorPrice) / priorPrice) * 100;
  const summary = `${symbol.toUpperCase()} 7-day move: ${formatPct(changePct)} (from ${formatCurrency(priorPrice)} to ${formatCurrency(latestPrice)}).`;

  stockWeekCache.set(symbol, { summary, fetchedAt: Date.now() });
  return summary;
};

