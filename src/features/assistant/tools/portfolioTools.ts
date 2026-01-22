import type { HoldingWithPrice } from '@/types/portfolio';
import { formatCurrency, formatPct } from './formatters';
import { extractRangeDays, wantsRangePerformance } from './questionAnalysis';
import { getCryptoChart } from './cryptoTools';
import { getStockSeries, parseStockSeries, getPriceOnOrBefore } from './stockTools';

const STOCK_SERIES_TTL = 60 * 60 * 1000;
const portfolioRangeCache = new Map<string, { summary: string; fetchedAt: number }>();

/**
 * Gets top movers (gainers or losers) from holdings.
 */
export const getTopMovers = (
  holdings: HoldingWithPrice[],
  direction: 'gainers' | 'losers',
  count = 3
): HoldingWithPrice[] => {
  const sorted = holdings
    .filter(holding => Number.isFinite(holding.plPct))
    .slice()
    .sort((a, b) => (direction === 'gainers' ? b.plPct - a.plPct : a.plPct - b.plPct));

  return sorted.slice(0, count);
};

/**
 * Generates a portfolio range performance summary.
 */
export const getPortfolioRangeSummary = async (
  question: string,
  holdings: HoldingWithPrice[]
): Promise<string | null> => {
  if (!wantsRangePerformance(question)) return null;

  const days = extractRangeDays(question);
  if (!days) return null;

  const holdingsKey = holdings
    .map(holding => `${holding.symbol}:${holding.quantity}:${holding.purchaseDate}`)
    .join('|');
  const cacheKey = `${days}:${holdingsKey}`;
  const cached = portfolioRangeCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < STOCK_SERIES_TTL) {
    return cached.summary;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let startTotal = 0;
  let endTotal = 0;

  for (const holding of holdings) {
    const purchaseDate = new Date(`${holding.purchaseDate}T00:00:00Z`);
    const effectiveStart = purchaseDate > startDate ? purchaseDate : startDate;
    if (effectiveStart > endDate) continue;

    if (holding.assetType === 'stock') {
      const seriesData = await getStockSeries(holding.symbol.toUpperCase(), days);
      const series = parseStockSeries(seriesData);
      const startPrice = getPriceOnOrBefore(series, effectiveStart);
      const endPrice = getPriceOnOrBefore(series, endDate);
      if (!startPrice || !endPrice) continue;
      startTotal += startPrice * holding.quantity;
      endTotal += endPrice * holding.quantity;
    } else {
      const chart = await getCryptoChart(holding.symbol.toLowerCase(), days);
      const prices = chart.prices;
      if (!prices || prices.length < 2) continue;
      const startTs = effectiveStart.getTime();
      const startPoint = prices.find(([timestamp]) => timestamp >= startTs) ?? prices[0];
      const endPoint = prices[prices.length - 1];
      const startPrice = startPoint?.[1];
      const endPrice = endPoint?.[1];
      if (!startPrice || !endPrice) continue;
      startTotal += startPrice * holding.quantity;
      endTotal += endPrice * holding.quantity;
    }
  }

  if (startTotal === 0) return null;

  const delta = endTotal - startTotal;
  const deltaPct = (delta / startTotal) * 100;
  const summary = `Portfolio change over last ${days} days: ${formatCurrency(delta)} (${formatPct(deltaPct)}) from ${formatCurrency(startTotal)} to ${formatCurrency(endTotal)}.`;

  portfolioRangeCache.set(cacheKey, { summary, fetchedAt: Date.now() });
  return summary;
};
