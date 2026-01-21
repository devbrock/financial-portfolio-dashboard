import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Holding,
  PortfolioState,
  UserPreferences,
  WatchlistItem,
  HistoricalStockCacheEntry,
} from '@/types/portfolio';
import { generateSeed } from '@/utils/generateSeed';
import { generateMockHoldings } from '@/utils/generateMockHoldings';
import { generateMockWatchlist } from '@/utils/generateMockWatchlist';

/**
 * Initial state for portfolio
 */
const initialState: PortfolioState = {
  holdings: [],
  watchlist: [],
  preferences: {
    theme: 'light',
    currency: 'USD',
    chartRange: '30d',
    sidebarOpen: true,
    sortPreference: {
      key: 'name',
      direction: 'asc',
    },
  },
  userSeed: {
    seed: '',
    initialized: false,
  },
  historicalCache: {
    stocks: {},
  },
};

/**
 * Portfolio slice - manages holdings and user preferences
 */
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    /**
     * Initialize portfolio with mock data for first-time users
     */
    initializePortfolio: state => {
      if (!state.userSeed.initialized) {
        const seed = generateSeed();
        const mockHoldings = generateMockHoldings(seed);
        const mockWatchlist = generateMockWatchlist(seed, mockHoldings);

        state.userSeed = {
          seed,
          initialized: true,
        };
        state.holdings = mockHoldings;
        state.watchlist = mockWatchlist;
      }
    },

    /**
     * Add new holding to portfolio
     */
    addHolding: (state, action: PayloadAction<Holding>) => {
      state.holdings.push(action.payload);
    },

    /**
     * Remove holding by ID
     */
    removeHolding: (state, action: PayloadAction<string>) => {
      state.holdings = state.holdings.filter(holding => holding.id !== action.payload);
    },

    /**
     * Add new watchlist item
     */
    addWatchlistItem: (state, action: PayloadAction<WatchlistItem>) => {
      state.watchlist.push(action.payload);
    },

    /**
     * Remove watchlist item by ID
     */
    removeWatchlistItem: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(item => item.id !== action.payload);
    },

    /**
     * Update existing holding
     */
    updateHolding: (state, action: PayloadAction<{ id: string; updates: Partial<Holding> }>) => {
      const index = state.holdings.findIndex(holding => holding.id === action.payload.id);
      if (index !== -1) {
        state.holdings[index] = {
          ...state.holdings[index],
          ...action.payload.updates,
        };
      }
    },

    /**
     * Update user preferences
     */
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    /**
     * Reset portfolio (for testing or user request)
     */
    resetPortfolio: () => {
      return initialState;
    },

    /**
     * Cache historical stock data to reduce API usage.
     */
    setStockHistoricalCache: (
      state,
      action: PayloadAction<{
        symbol: string;
        entry: HistoricalStockCacheEntry;
      }>
    ) => {
      if (!state.historicalCache) {
        state.historicalCache = { stocks: {} };
      }
      state.historicalCache.stocks[action.payload.symbol] = action.payload.entry;
    },
  },
});

export const {
  initializePortfolio,
  addHolding,
  removeHolding,
  addWatchlistItem,
  removeWatchlistItem,
  updateHolding,
  updatePreferences,
  resetPortfolio,
  setStockHistoricalCache,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
