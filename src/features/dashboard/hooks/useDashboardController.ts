import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { toast } from 'sonner';
import { clampNumber } from '@/utils/clampNumber';
import { useAppSelector } from '@/store/hooks';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { useDashboardData } from './useDashboardData';
import { useHoldingsFilterSort } from './useHoldingsFilterSort';
import { useDashboardMutations } from './useDashboardMutations';

/**
 * useDashboardController
 * Centralizes dashboard state, data transforms, and mutations.
 */
export function useDashboardController() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
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
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => navigate({ to: DASHBOARD_NAV_ROUTES[next] }),
    [navigate]
  );

  const dataUpdatedAtRef = useRef(0);
  const lastResetRef = useRef(0);
  const lastToastErrorRef = useRef<string | null>(null);

  const { removeHolding, removeWatchlist } = useDashboardMutations();
  const {
    watchlist, allocation, holdings, metrics,
    dailyPlUsd, dailyPlPct, isLoading, isError, errorMessage, dataUpdatedAt,
  } = useDashboardData();
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
      return () => { window.clearTimeout(start); window.clearTimeout(stop); };
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    if (isError && errorMessage && lastToastErrorRef.current !== errorMessage) {
      toast.error(errorMessage);
      lastToastErrorRef.current = errorMessage;
    } else if (!isError) {
      lastToastErrorRef.current = null;
    }
  }, [errorMessage, isError]);

  const liveMessage = useMemo(() => {
    if (isLoading) return 'Loading portfolio data.';
    if (dataUpdatedAt > 0) return 'Prices updated.';
    return 'Portfolio data loaded.';
  }, [dataUpdatedAt, isLoading]);

  const errorAnnounce = useMemo(() => (isError ? errorMessage || 'Market data unavailable.' : ''), [errorMessage, isError]);
  const handleRetry = useCallback(() => queryClient.invalidateQueries(), [queryClient]);

  return {
    activeNav, handleNavChange, userName: user?.firstName || 'Investor',
    range, setRange, holdingsQuery, setHoldingsQuery, sortKey, sortDir, triggerSort,
    confirmRemoveId, setConfirmRemoveId, lastUpdatedSeconds,
    isAddAssetOpen, setIsAddAssetOpen, isAddWatchlistOpen, setIsAddWatchlistOpen,
    flashPrices, handleAddAsset, handleAddWatchlist,
    watchlist, allocation, holdings, metrics, dailyPlUsd, dailyPlPct,
    isLoading, isError, errorMessage, liveMessage, errorAnnounce, visibleHoldings,
    handleRetry, removeHolding, removeWatchlist,
  };
}
