import { describe, expect, it } from 'vitest';
import { generateMockWatchlist } from '../generateMockWatchlist';

describe('generateMockWatchlist', () => {
  it('returns deterministic results for the same seed', () => {
    const watchlistA = generateMockWatchlist('seed');
    const watchlistB = generateMockWatchlist('seed');
    const stripIds = (items: typeof watchlistA) => items.map(({ id, ...rest }) => rest);
    expect(stripIds(watchlistA)).toEqual(stripIds(watchlistB));
  });

  it('returns watchlist items with required fields', () => {
    const watchlist = generateMockWatchlist('seed');
    expect(watchlist.length).toBeGreaterThan(0);
    const item = watchlist[0];
    expect(item.id).toBeTruthy();
    expect(item.symbol).toBeTruthy();
    expect(item.assetType).toBeTruthy();
  });
});
