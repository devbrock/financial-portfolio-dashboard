import type { HoldingWithPrice, PortfolioMetrics, WatchlistItemWithPrice } from '@/types/portfolio';
import type { MarketQuote } from '@/features/market/hooks/useMarketQuotes';

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

const getTopMovers = (
  holdings: HoldingWithPrice[],
  direction: 'gainers' | 'losers',
  count = 3
) => {
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

export const buildAssistantToolContext = ({
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
