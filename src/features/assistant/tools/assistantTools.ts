import type { HoldingWithPrice, PortfolioMetrics, WatchlistItemWithPrice } from '@/types/portfolio';
import type { MarketQuote } from '@/features/market/hooks/useMarketQuotes';
import type { AlphaVantageTimeSeriesDaily } from '@/types/alphaVantage';
import type { CoinGeckoMarketChart } from '@/types/coinGecko';
import { coinGeckoApi } from '@/services/api/functions/coinGeckoApi';
import { alphaVantageApi } from '@/services/api/functions/alphaVantageApi';

type AssistantToolData = {
  question: string;
  holdings: HoldingWithPrice[];
  watchlist: WatchlistItemWithPrice[];
  metrics: PortfolioMetrics;
  portfolioUpdatedAt: number;
  marketIndices: MarketQuote[];
  marketUpdatedAt: number;
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
const formatPct = (value: number) => `${value.toFixed(2)}%`;

const formatUpdatedAt = (timestamp: number) => {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleString();
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getTopMovers = (holdings: HoldingWithPrice[], direction: 'gainers' | 'losers', count = 3) => {
  const sorted = holdings
    .filter(holding => Number.isFinite(holding.plPct))
    .slice()
    .sort((a, b) => (direction === 'gainers' ? b.plPct - a.plPct : a.plPct - b.plPct));

  return sorted.slice(0, count);
};

const formatHolding = (holding: HoldingWithPrice) => {
  const label = holding.companyName?.trim() || holding.symbol.toUpperCase();
  const symbol = holding.symbol.toUpperCase();
  return `${label} (${symbol}) ${formatCurrency(holding.currentPrice)} | ${formatPct(
    holding.plPct
  )}`;
};

const formatWatchlistItem = (item: WatchlistItemWithPrice) => {
  const label = item.companyName?.trim() || item.symbol.toUpperCase();
  const symbol = item.symbol.toUpperCase();
  return `${label} (${symbol}) ${formatCurrency(item.currentPrice)} | ${formatPct(item.changePct)}`;
};

const formatIndex = (quote: MarketQuote) => {
  const price = quote.quote?.c ?? 0;
  const changePct = quote.quote?.dp ?? 0;
  return `${quote.name} (${quote.symbol}) ${formatCurrency(price)} | ${formatPct(changePct)}`;
};

const wantsPortfolioContext = (question: string) =>
  /portfolio|holding|watchlist|position|profit|loss|p\/l|return|performance|gain|lose|move/i.test(
    question
  );

const wantsMarketContext = (question: string) =>
  /market|index|indices|s&p|dow|nasdaq|russell|sector/i.test(question);

const CRYPTO_ALIASES: Record<string, string> = {
  btc: 'bitcoin',
  bitcoin: 'bitcoin',
  eth: 'ethereum',
  ethereum: 'ethereum',
  sol: 'solana',
  solana: 'solana',
  ada: 'cardano',
  cardano: 'cardano',
  doge: 'dogecoin',
  dogecoin: 'dogecoin',
  xrp: 'ripple',
  ripple: 'ripple',
  ltc: 'litecoin',
  litecoin: 'litecoin',
};

const CRYPTO_LABELS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  ripple: 'XRP',
  litecoin: 'LTC',
};

const wantsWeeklyMovement = (question: string) =>
  /weekly|this week|last week|7\s*day|past 7|last 7/i.test(question);

const wantsRangePerformance = (question: string) =>
  /portfolio|performance|return|p\/l|profit|loss|gain|move/i.test(question) &&
  /(last|past|over)\s+\d+/i.test(question);

const extractCryptoId = (question: string) => {
  const normalized = question.toLowerCase();
  for (const [alias, id] of Object.entries(CRYPTO_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(normalized)) {
      return id;
    }
  }
  return null;
};

const searchCryptoId = async (question: string) => {
  const normalized = question.toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(token => token.length >= 3);
  for (const token of tokens) {
    if (CRYPTO_ALIASES[token]) {
      return CRYPTO_ALIASES[token];
    }
  }

  const candidate = tokens[0];
  if (!candidate) return null;

  const response = await coinGeckoApi.searchCoins(candidate);
  const match = response.data.coins?.[0];
  return match?.id ?? null;
};

const CRYPTO_WEEK_TTL = 60 * 60 * 1000;
const CRYPTO_CHART_TTL = 60 * 60 * 1000;
const STOCK_SERIES_TTL = 60 * 60 * 1000;

const cryptoWeekCache = new Map<string, { summary: string; fetchedAt: number }>();
const cryptoChartCache = new Map<string, { data: CoinGeckoMarketChart; fetchedAt: number }>();
const stockSeriesCache = new Map<
  string,
  { data: AlphaVantageTimeSeriesDaily; fetchedAt: number }
>();
const stockWeekCache = new Map<string, { summary: string; fetchedAt: number }>();
const portfolioRangeCache = new Map<string, { summary: string; fetchedAt: number }>();

const parseStockSeries = (data?: AlphaVantageTimeSeriesDaily) => {
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

const getPriceOnOrBefore = (series: Map<string, number>, target: Date) => {
  const targetKey = toDateKey(target);
  const entries = Array.from(series.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const match = entries.find(([date]) => date <= targetKey);
  return match?.[1] ?? entries[entries.length - 1]?.[1] ?? null;
};

const getLatestPrice = (series: Map<string, number>) => {
  const entries = Array.from(series.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  return entries[0]?.[1] ?? null;
};

const getCryptoChart = async (coinId: string, days: number) => {
  const cacheKey = `${coinId}-${days}`;
  const cached = cryptoChartCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CRYPTO_CHART_TTL) {
    return cached.data;
  }
  const response = await coinGeckoApi.getMarketChart(coinId, {
    vs_currency: 'usd',
    days: String(days),
  });
  cryptoChartCache.set(cacheKey, { data: response.data, fetchedAt: Date.now() });
  return response.data;
};

const getStockSeries = async (symbol: string, days: number) => {
  const cached = stockSeriesCache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < STOCK_SERIES_TTL) {
    return cached.data;
  }
  const outputsize = days > 100 ? 'full' : 'compact';
  const response = await alphaVantageApi.getTimeSeriesDaily(symbol, outputsize);
  stockSeriesCache.set(symbol, { data: response.data, fetchedAt: Date.now() });
  return response.data;
};

const extractRangeDays = (question: string) => {
  const match = question.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
  if (match) {
    const value = Number(match[1]);
    if (Number.isNaN(value) || value <= 0) return null;
    const unit = match[2].toLowerCase();
    if (unit.startsWith('week')) return value * 7;
    if (unit.startsWith('month')) return value * 30;
    if (unit.startsWith('year')) return value * 365;
    return value;
  }

  if (/this week|weekly/i.test(question)) return 7;
  if (/this month|monthly/i.test(question)) return 30;
  if (/this quarter|quarterly/i.test(question)) return 90;
  if (/this year|yearly|ytd/i.test(question)) return 365;

  return null;
};

const extractStockSymbol = (
  question: string,
  holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[]
) => {
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

const getCryptoWeeklySummary = async (question: string) => {
  if (!wantsWeeklyMovement(question)) return null;

  const coinId = extractCryptoId(question) ?? (await searchCryptoId(question));
  if (!coinId) return null;

  const cached = cryptoWeekCache.get(coinId);
  if (cached && Date.now() - cached.fetchedAt < CRYPTO_WEEK_TTL) {
    return cached.summary;
  }

  const response = await coinGeckoApi.getMarketChart(coinId, {
    vs_currency: 'usd',
    days: '7',
  });
  const prices = response.data.prices;
  if (!prices || prices.length < 2) return null;

  const first = prices[0][1];
  const last = prices[prices.length - 1][1];
  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;

  const changePct = ((last - first) / first) * 100;
  const label = CRYPTO_LABELS[coinId] ?? coinId.toUpperCase();
  const summary = `${label} 7-day move: ${formatPct(changePct)} (from ${formatCurrency(
    first
  )} to ${formatCurrency(last)}).`;

  cryptoWeekCache.set(coinId, { summary, fetchedAt: Date.now() });
  return summary;
};

const getStockWeeklySummary = async (
  question: string,
  holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[]
) => {
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
  const summary = `${symbol.toUpperCase()} 7-day move: ${formatPct(changePct)} (from ${formatCurrency(
    priorPrice
  )} to ${formatCurrency(latestPrice)}).`;

  stockWeekCache.set(symbol, { summary, fetchedAt: Date.now() });
  return summary;
};

const getPortfolioRangeSummary = async (question: string, holdings: HoldingWithPrice[]) => {
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
  const summary = `Portfolio change over last ${days} days: ${formatCurrency(
    delta
  )} (${formatPct(deltaPct)}) from ${formatCurrency(startTotal)} to ${formatCurrency(endTotal)}.`;

  portfolioRangeCache.set(cacheKey, { summary, fetchedAt: Date.now() });
  return summary;
};

export const buildAssistantToolContext = async ({
  question,
  holdings,
  watchlist,
  metrics,
  portfolioUpdatedAt,
  marketIndices,
  marketUpdatedAt,
}: AssistantToolData) => {
  const wantsPortfolio = wantsPortfolioContext(question);
  const wantsMarket = wantsMarketContext(question);
  const includeFallback = !wantsPortfolio && !wantsMarket;
  const includePortfolio = wantsPortfolio || includeFallback;
  const includeMarket = wantsMarket || includeFallback;

  const lines: string[] = [];
  const cryptoWeeklySummary = await getCryptoWeeklySummary(question);
  const stockWeeklySummary = await getStockWeeklySummary(question, holdings, watchlist);
  const portfolioRangeSummary = await getPortfolioRangeSummary(question, holdings);

  if (cryptoWeeklySummary) lines.push(cryptoWeeklySummary);
  if (stockWeeklySummary) lines.push(stockWeeklySummary);
  if (portfolioRangeSummary) lines.push(portfolioRangeSummary);

  if (includePortfolio) {
    const updatedAt = formatUpdatedAt(portfolioUpdatedAt);
    lines.push(
      `Portfolio summary${updatedAt ? ` (data as of ${updatedAt})` : ''}:`,
      `Total value ${formatCurrency(metrics.totalValue)}; Total P/L ${formatCurrency(
        metrics.totalPL
      )} (${formatPct(metrics.totalPLPct)}).`
    );

    if (holdings.length > 0 && !includeFallback) {
      const topGainers = getTopMovers(holdings, 'gainers');
      const topLosers = getTopMovers(holdings, 'losers');

      lines.push(
        'Top holding gainers:',
        ...topGainers.map(formatHolding),
        'Top holding losers:',
        ...topLosers.map(formatHolding)
      );
    }

    if (watchlist.length > 0 && !includeFallback) {
      const watchlistMovers = watchlist
        .slice()
        .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
        .slice(0, 5);
      lines.push('Watchlist movers:', ...watchlistMovers.map(formatWatchlistItem));
    }
  }

  if (includeMarket) {
    const updatedAt = formatUpdatedAt(marketUpdatedAt);
    const indices = marketIndices.filter(item => item.quote);
    if (indices.length > 0) {
      lines.push(
        `Market indices${updatedAt ? ` (data as of ${updatedAt})` : ''}:`,
        ...indices.map(formatIndex)
      );
    }
  }

  return lines.length > 0 ? lines.join(' ') : null;
};
