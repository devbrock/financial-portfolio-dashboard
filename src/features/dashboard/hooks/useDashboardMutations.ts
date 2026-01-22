import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addHolding,
  addWatchlistItem,
  removeHolding,
  removeWatchlistItem,
} from '@/features/portfolio/portfolioSlice';
import {
  removeHoldingFromPortfolio,
  removeWatchlistItemFromPortfolio,
} from '@/services/api/functions/portfolioApi';

/**
 * Provides optimistic mutations for removing holdings and watchlist items.
 */
export function useDashboardMutations() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const rawHoldings = useAppSelector(state => state.portfolio.holdings);
  const rawWatchlist = useAppSelector(state => state.portfolio.watchlist);

  const removeHoldingMutation = useMutation({
    mutationFn: removeHoldingFromPortfolio,
    onMutate: async (holdingId: string) => {
      const existing = rawHoldings.find(item => item.id === holdingId);
      if (existing) dispatch(removeHolding(holdingId));
      return { existing };
    },
    onError: (_error, _holdingId, context) => {
      if (context?.existing) dispatch(addHolding(context.existing));
      toast.error('Failed to remove the asset. Please try again.');
    },
    onSuccess: () => {
      toast.success('Asset removed from your portfolio.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const removeWatchlistMutation = useMutation({
    mutationFn: removeWatchlistItemFromPortfolio,
    onMutate: async (watchlistId: string) => {
      const existing = rawWatchlist.find(item => item.id === watchlistId);
      if (existing) dispatch(removeWatchlistItem(watchlistId));
      return { existing };
    },
    onError: (_error, _watchlistId, context) => {
      if (context?.existing) dispatch(addWatchlistItem(context.existing));
      toast.error('Failed to remove the watchlist item. Please try again.');
    },
    onSuccess: () => {
      toast.success('Removed from your watchlist.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  return {
    removeHolding: (id: string) => removeHoldingMutation.mutate(id),
    removeWatchlist: (id: string) => removeWatchlistMutation.mutate(id),
  };
}

