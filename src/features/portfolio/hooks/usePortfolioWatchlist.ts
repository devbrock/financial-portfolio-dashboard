import { useAppSelector } from '@/store/hooks';

/**
 * Get watchlist items from Redux store
 */
export function usePortfolioWatchlist() {
  return useAppSelector(state => state.portfolio.watchlist ?? []);
}
