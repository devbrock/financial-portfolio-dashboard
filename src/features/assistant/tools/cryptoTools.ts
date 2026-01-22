import type { CoinGeckoMarketChart } from '@/types/coinGecko';
import { coinGeckoApi } from '@/services/api/functions/coinGeckoApi';
import { formatCurrency, formatPct } from './formatters';
import { wantsWeeklyMovement } from './questionAnalysis';

/** Maps common crypto aliases to CoinGecko IDs. */
export const CRYPTO_ALIASES: Record<string, string> = {
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

/** Maps CoinGecko IDs to display labels. */
export const CRYPTO_LABELS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  ripple: 'XRP',
  litecoin: 'LTC',
};

const CRYPTO_WEEK_TTL = 60 * 60 * 1000;
const CRYPTO_CHART_TTL = 60 * 60 * 1000;

const cryptoWeekCache = new Map<string, { summary: string; fetchedAt: number }>();
const cryptoChartCache = new Map<string, { data: CoinGeckoMarketChart; fetchedAt: number }>();

/**
 * Extracts a known crypto ID from a question using alias matching.
 */
export const extractCryptoId = (question: string): string | null => {
  const normalized = question.toLowerCase();
  for (const [alias, id] of Object.entries(CRYPTO_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(normalized)) {
      return id;
    }
  }
  return null;
};

/**
 * Searches for a crypto ID by tokenizing the question and querying CoinGecko.
 */
export const searchCryptoId = async (question: string): Promise<string | null> => {
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

/**
 * Fetches crypto market chart data with caching.
 */
export const getCryptoChart = async (
  coinId: string,
  days: number
): Promise<CoinGeckoMarketChart> => {
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

/**
 * Generates a weekly summary for a crypto asset.
 */
export const getCryptoWeeklySummary = async (question: string): Promise<string | null> => {
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
  const summary = `${label} 7-day move: ${formatPct(changePct)} (from ${formatCurrency(first)} to ${formatCurrency(last)}).`;

  cryptoWeekCache.set(coinId, { summary, fetchedAt: Date.now() });
  return summary;
};
