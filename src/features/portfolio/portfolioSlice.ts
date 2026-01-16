import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Holding,
  PortfolioState,
  UserPreferences,
} from "@/types/portfolio";
import { generateSeed } from "@/utils/generateSeed";
import { generateMockHoldings } from "@/utils/generateMockHoldings";

/**
 * Initial state for portfolio
 */
const initialState: PortfolioState = {
  holdings: [],
  preferences: {
    theme: "light",
    currency: "USD",
    chartRange: "30d",
    sortPreference: {
      key: "name",
      direction: "asc",
    },
  },
  userSeed: {
    seed: "",
    initialized: false,
  },
};

/**
 * Portfolio slice - manages holdings and user preferences
 */
const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    /**
     * Initialize portfolio with mock data for first-time users
     */
    initializePortfolio: (state) => {
      if (!state.userSeed.initialized) {
        const seed = generateSeed();
        const mockHoldings = generateMockHoldings(seed);

        state.userSeed = {
          seed,
          initialized: true,
        };
        state.holdings = mockHoldings;
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
      state.holdings = state.holdings.filter(
        (holding) => holding.id !== action.payload
      );
    },

    /**
     * Update existing holding
     */
    updateHolding: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Holding> }>
    ) => {
      const index = state.holdings.findIndex(
        (holding) => holding.id === action.payload.id
      );
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
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    /**
     * Reset portfolio (for testing or user request)
     */
    resetPortfolio: (state) => {
      state.holdings = [];
      state.userSeed = {
        seed: "",
        initialized: false,
      };
    },
  },
});

export const {
  initializePortfolio,
  addHolding,
  removeHolding,
  updateHolding,
  updatePreferences,
  resetPortfolio,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
