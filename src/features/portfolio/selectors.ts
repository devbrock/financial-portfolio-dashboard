import type { RootState } from '@/store/store';

export const selectHoldings = (state: RootState) => state.portfolio.holdings;
export const selectWatchlist = (state: RootState) => state.portfolio.watchlist;
export const selectPreferences = (state: RootState) => state.portfolio.preferences;
export const selectUserSeed = (state: RootState) => state.portfolio.userSeed;
