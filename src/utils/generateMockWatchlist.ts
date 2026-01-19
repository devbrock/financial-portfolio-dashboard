import { SeededRandom } from './SeededRandom';
import type { AssetType, Holding, WatchlistItem } from '@/types/portfolio';

const STOCK_POOL = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'TSLA',
  'NVDA',
  'META',
  'JPM',
  'V',
  'WMT',
] as const;

const CRYPTO_POOL = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'] as const;

type PoolEntry = {
  symbol: string;
  assetType: AssetType;
};

const WATCHLIST_POOL: PoolEntry[] = [
  ...STOCK_POOL.map(symbol => ({ symbol, assetType: 'stock' as const })),
  ...CRYPTO_POOL.map(symbol => ({ symbol, assetType: 'crypto' as const })),
];

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateMockWatchlist(seed: string, holdings: Holding[] = []): WatchlistItem[] {
  const rng = new SeededRandom(`${seed}-watchlist`);
  const existing = new Set(holdings.map(holding => `${holding.assetType}:${holding.symbol}`));
  const shuffled = rng.shuffle([...WATCHLIST_POOL]);
  const count = rng.nextInt(3, 6);
  const items: WatchlistItem[] = [];

  for (const entry of shuffled) {
    if (items.length >= count) break;
    const key = `${entry.assetType}:${entry.symbol}`;
    if (existing.has(key)) {
      continue;
    }
    items.push({
      id: generateId(),
      symbol: entry.symbol,
      assetType: entry.assetType,
    });
  }

  return items;
}
