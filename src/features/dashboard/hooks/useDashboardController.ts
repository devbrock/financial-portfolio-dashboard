import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { toast } from 'sonner';
import { clampNumber } from '@/utils/clampNumber';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addHolding,
  addWatchlistItem,
  removeHolding,
  removeWatchlistItem,
} from '@/features/portfolio/portfolioSlice';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import {
  removeHoldingFromPortfolio,
  removeWatchlistItemFromPortfolio,
} from '@/services/api/functions/portfolioApi';
import { useDashboardData } from './useDashboardData';
import { useHoldingsFilterSort } from './useHoldingsFilterSort';

/**
 * useDashboardController
 * Centralizes dashboard state, data transforms, and mutations.
 */
export function useDashboardController() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const rawHoldings = useAppSelector(state => state.portfolio.holdings);
  const rawWatchlist = useAppSelector(state => state.portfolio.watchlist);
  const user = useAppSelector(state => state.auth.user);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(12);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddWatchlistOpen, setIsAddWatchlistOpen] = useState(false);
  const [flashPrices, setFlashPrices] = useState(false);
  const handleAddAsset = useCallback(() => setIsAddAssetOpen(true), []);
  const handleAddWatchlist = useCallback(() => setIsAddWatchlistOpen(true), []);
  const handleNavChange = useCallback(
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => {
      navigate({ to: DASHBOARD_NAV_ROUTES[next] });
    },
    [navigate]
  );
  const dataUpdatedAtRef = useRef(0);
  const lastResetRef = useRef(0);

  const removeHoldingMutation = useMutation({
    mutationFn: removeHoldingFromPortfolio,
    onMutate: async (holdingId: string) => {
      const existing = rawHoldings.find(item => item.id === holdingId);
      if (existing) {
        dispatch(removeHolding(holdingId));
      }
      return { existing };
    },
    onError: (_error, _holdingId, context) => {
      if (context?.existing) {
        dispatch(addHolding(context.existing));
      }
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
      if (existing) {
        dispatch(removeWatchlistItem(watchlistId));
      }
      return { existing };
    },
    onError: (_error, _watchlistId, context) => {
      if (context?.existing) {
        dispatch(addWatchlistItem(context.existing));
      }
      toast.error('Failed to remove the watchlist item. Please try again.');
    },
    onSuccess: () => {
      toast.success('Removed from your watchlist.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const {
    watchlist,
    allocation,
    holdings,
    metrics,
    dailyPlUsd,
    dailyPlPct,
    isLoading,
    isError,
    errorMessage,
    dataUpdatedAt,
  } = useDashboardData();
  const lastToastErrorRef = useRef<string | null>(null);
  const { holdingsQuery, setHoldingsQuery, sortKey, sortDir, triggerSort, visibleHoldings } =
    useHoldingsFilterSort(holdings);

  useEffect(() => {
    const t = window.setInterval(() => {
      setLastUpdatedSeconds(s => {
        if (dataUpdatedAtRef.current !== lastResetRef.current) {
          lastResetRef.current = dataUpdatedAtRef.current;
          return 0;
        }
        return clampNumber(s + 1, 0, 999);
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    dataUpdatedAtRef.current = dataUpdatedAt;
    if (dataUpdatedAt > 0) {
      const start = window.setTimeout(() => setFlashPrices(true), 0);
      const stop = window.setTimeout(() => setFlashPrices(false), 1200);
      return () => {
        window.clearTimeout(start);
        window.clearTimeout(stop);
      };
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    if (isError) {
      if (errorMessage && lastToastErrorRef.current !== errorMessage) {
        toast.error(errorMessage);
        lastToastErrorRef.current = errorMessage;
      }
    } else {
      lastToastErrorRef.current = null;
    }
  }, [errorMessage, isError]);

  const liveMessage = useMemo(() => {
    if (isLoading) return 'Loading portfolio data.';
    if (dataUpdatedAt > 0) return 'Prices updated.';
    return 'Portfolio data loaded.';
  }, [dataUpdatedAt, isLoading]);

  const errorAnnounce = useMemo(() => {
    if (!isError) return '';
    return errorMessage || 'Market data unavailable.';
  }, [errorMessage, isError]);

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    activeNav,
    handleNavChange,
    userName: user?.firstName || 'Investor',
    range,
    setRange,
    holdingsQuery,
    setHoldingsQuery,
    sortKey,
    sortDir,
    triggerSort,
    confirmRemoveId,
    setConfirmRemoveId,
    lastUpdatedSeconds,
    isAddAssetOpen,
    setIsAddAssetOpen,
    isAddWatchlistOpen,
    setIsAddWatchlistOpen,
    flashPrices,
    handleAddAsset,
    handleAddWatchlist,
    watchlist,
    allocation,
    holdings,
    metrics,
    dailyPlUsd,
    dailyPlPct,
    isLoading,
    isError,
    errorMessage,
    liveMessage,
    errorAnnounce,
    visibleHoldings,
    handleRetry,
    removeHolding: (id: string) => removeHoldingMutation.mutate(id),
    removeWatchlist: (id: string) => removeWatchlistMutation.mutate(id),
  };
}
