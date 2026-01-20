import { describe, expect, it } from 'vitest';
import { selectHoldings, selectPreferences, selectUserSeed, selectWatchlist } from '../selectors';
import type { RootState } from '@/store/store';

const state = {
  portfolio: {
    holdings: [
      {
        id: '1',
        symbol: 'AAPL',
        assetType: 'stock',
        quantity: 1,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      },
    ],
    watchlist: [
      {
        id: 'w1',
        symbol: 'AAPL',
        assetType: 'stock',
      },
    ],
    preferences: {
      theme: 'light',
      currency: 'USD',
      chartRange: '30d',
      sidebarOpen: true,
      sortPreference: { key: 'name', direction: 'asc' },
    },
    userSeed: { seed: 'seed', initialized: true },
    historicalCache: {
      stocks: {},
    },
  },
  assistant: {
    messages: [],
  },
  auth: {
    user: null,
    sessionId: null,
  },
  _persist: {
    version: 1,
    rehydrated: true,
  },
} satisfies RootState;

describe('portfolio selectors', () => {
  it('selects holdings', () => {
    expect(selectHoldings(state)).toHaveLength(1);
  });

  it('selects preferences', () => {
    expect(selectPreferences(state).theme).toBe('light');
  });

  it('selects user seed', () => {
    expect(selectUserSeed(state).initialized).toBe(true);
  });

  it('selects watchlist', () => {
    expect(selectWatchlist(state)).toHaveLength(1);
  });
});
