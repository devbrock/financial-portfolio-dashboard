/**
 * Assistant Tools Module
 *
 * This module provides context-building utilities for the OrionGPT assistant.
 * It analyzes user questions and assembles relevant portfolio, market, and
 * asset-specific data to provide informed responses.
 */

// Main context builder
export { buildAssistantToolContext } from './assistantTools';

// Types
export type { AssistantToolData } from './assistantTools.types';

// Formatters (for potential reuse)
export {
  formatCurrency,
  formatPct,
  formatUpdatedAt,
  formatHolding,
  formatWatchlistItem,
  formatIndex,
} from './formatters';

// Question analysis utilities
export {
  wantsPortfolioContext,
  wantsMarketContext,
  wantsWeeklyMovement,
  wantsRangePerformance,
  extractRangeDays,
} from './questionAnalysis';

// Crypto tools
export {
  CRYPTO_ALIASES,
  CRYPTO_LABELS,
  extractCryptoId,
  searchCryptoId,
  getCryptoChart,
  getCryptoWeeklySummary,
} from './cryptoTools';

// Stock tools
export {
  parseStockSeries,
  getPriceOnOrBefore,
  getLatestPrice,
  getStockSeries,
  extractStockSymbol,
  getStockWeeklySummary,
} from './stockTools';

// Portfolio tools
export { getTopMovers, getPortfolioRangeSummary } from './portfolioTools';
