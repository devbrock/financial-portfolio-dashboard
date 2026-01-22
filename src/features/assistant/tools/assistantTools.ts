import type { AssistantToolData } from './assistantTools.types';
import {
  formatCurrency,
  formatPct,
  formatUpdatedAt,
  formatHolding,
  formatWatchlistItem,
  formatIndex,
} from './formatters';
import { wantsPortfolioContext, wantsMarketContext } from './questionAnalysis';
import { getCryptoWeeklySummary } from './cryptoTools';
import { getStockWeeklySummary } from './stockTools';
import { getTopMovers, getPortfolioRangeSummary } from './portfolioTools';

/**
 * Builds context for the assistant based on user question and portfolio/market data.
 * Analyzes the question to determine what context is relevant and fetches
 * additional data (weekly summaries, range performance) as needed.
 *
 * @param data - The assistant tool data containing question, holdings, watchlist, and market info
 * @returns A string of context lines, or null if no relevant context
 */
export const buildAssistantToolContext = async ({
  question,
  holdings,
  watchlist,
  metrics,
  portfolioUpdatedAt,
  marketIndices,
  marketUpdatedAt,
}: AssistantToolData): Promise<string | null> => {
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
      `Total value ${formatCurrency(metrics.totalValue)}; Total P/L ${formatCurrency(metrics.totalPL)} (${formatPct(metrics.totalPLPct)}).`
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
