import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Inline,
  Input,
  Modal,
  Stack,
  Text,
} from '@components';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SortKey, SortDir, HoldingRow } from '@/types/dashboard';
import { clampNumber } from '@utils/clampNumber';
import { compareStrings } from '@utils/compareStrings';
import { toast } from 'sonner';
import { useDashboardData } from './hooks/useDashboardData';
import {
  AddAssetModal,
  AddWatchlistModal,
  DashboardHeader,
  PerformanceChart,
  AllocationChart,
  HoldingsTable,
  HoldingsMobileCard,
  EmptyHoldings,
  WatchlistCard,
} from './components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addHolding,
  addWatchlistItem,
  removeHolding,
  removeWatchlistItem,
} from '@/features/portfolio/portfolioSlice';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { AppShell } from '@/features/shell/AppShell';
import {
  removeHoldingFromPortfolio,
  removeWatchlistItemFromPortfolio,
} from '@/services/api/functions/portfolioApi';

export function Dashboard() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const rawHoldings = useAppSelector(state => state.portfolio.holdings);
  const rawWatchlist = useAppSelector(state => state.portfolio.watchlist);
  const user = useAppSelector(state => state.auth.user);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [holdingsQuery, setHoldingsQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
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

  // Get dashboard data
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

  // Update "last updated" timer
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

  // Filter and sort holdings
  const visibleHoldings: readonly HoldingRow[] = useMemo(() => {
    const q = holdingsQuery.trim().toLowerCase();
    const filtered = q
      ? holdings.filter(h => h.name.toLowerCase().includes(q) || h.ticker.toLowerCase().includes(q))
      : holdings;

    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * compareStrings(a.name, b.name);
        case 'date':
          return dir * compareStrings(a.date, b.date);
        case 'status':
          return dir * compareStrings(a.status, b.status);
        case 'volume':
          return dir * (a.volume - b.volume);
        case 'changePct':
          return dir * (a.changePct - b.changePct);
        case 'purchasePrice':
          return dir * (a.purchasePrice - b.purchasePrice);
        case 'priceUsd':
          return dir * (a.priceUsd - b.priceUsd);
        case 'pnlUsd':
          return dir * (a.pnlUsd - b.pnlUsd);
      }
    });

    return sorted;
  }, [holdings, holdingsQuery, sortDir, sortKey]);

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const triggerSort = (key: SortKey) => {
    setSortKey(prev => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      return prev;
    });
  };

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={handleNavChange}
      liveMessage={liveMessage}
      errorMessage={errorAnnounce}
    >
      <Container className="max-w-none px-0">
        <Stack gap="lg">
                {/* App header */}
            {isError ? (
                  <Card className="border-amber-200 bg-amber-50/60">
                    <CardBody>
                      <Inline align="center" justify="between" className="gap-4">
                        <div className="min-w-0">
                          <Text as="div" className="font-semibold text-amber-900">
                            Market data is temporarily unavailable.
                          </Text>
                          <Text as="div" size="sm" className="text-amber-800">
                            {errorMessage}
                          </Text>
                        </div>
                        <Button variant="secondary" className="shrink-0" onClick={handleRetry}>
                          Retry
                        </Button>
                      </Inline>
                    </CardBody>
                  </Card>
                ) : null}

                {/* Welcome + top actions */}
                <DashboardHeader
                  userName={user?.firstName || 'Investor'}
                  portfolioValue={metrics.totalValue}
                  lastUpdated={lastUpdatedSeconds}
                  dailyChangeUsd={dailyPlUsd}
                  dailyChangePct={dailyPlPct}
                />

                {/* Watchlist */}
                <section aria-label="My watchlist">
                  <Card>
                    <CardHeader className="pb-3">
                      <Inline align="center" justify="between" className="w-full gap-3">
                        <div className="min-w-0">
                          <Heading as="h3" className="text-base">
                            My Watchlist
                          </Heading>
                          <Text as="div" size="sm" tone="muted">
                            Track live prices for assets you care about.
                          </Text>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleAddWatchlist}>
                          Add to Watchlist
                        </Button>
                      </Inline>
                    </CardHeader>
                    <CardBody>
                      {watchlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--ui-border) px-6 py-10 text-center">
                          <Text as="div" className="text-sm font-semibold">
                            Your watchlist is empty
                          </Text>
                          <Text as="div" size="sm" tone="muted">
                            Add a stock or crypto to start tracking live prices.
                          </Text>
                          <Button variant="primary" size="sm" onClick={handleAddWatchlist}>
                            Add your first asset
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex gap-3 overflow-x-auto pb-2"
                          aria-label="Watchlist ticker list"
                        >
                          {watchlist.map(item => (
                            <WatchlistCard
                              key={item.id}
                              item={item}
                              flash={flashPrices}
                              onRemove={id => {
                                removeWatchlistMutation.mutate(id);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </section>

                {/* Charts */}
                <section aria-label="Charts" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <PerformanceChart range={range} onRangeChange={setRange} flash={flashPrices} />
                  <AllocationChart
                    data={allocation}
                    totalInvested={metrics.totalCostBasis}
                    flash={flashPrices}
                  />
                </section>

                {/* Holdings */}
                <section aria-label="Holdings">
                  <Card>
                    <CardHeader className="pb-3">
                      <Inline align="center" justify="between" className="w-full gap-3">
                        <div className="min-w-0 flex-1">
                          <Heading as="h3" className="text-base">
                            My Holdings
                          </Heading>
                          <Text as="div" size="sm" tone="muted">
                            Track transactions, positions, performance and status.
                          </Text>
                        </div>

                        <div className="flex w-full flex-1 justify-center">
                          <div className="relative w-full max-w-[280px]">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--ui-text-muted)">
                              <Search />
                            </span>
                            <Input
                              aria-label="Search holdings"
                              placeholder="Search..."
                              value={holdingsQuery}
                              onChange={e => setHoldingsQuery(e.currentTarget.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="flex flex-1 justify-end">
                          <Button variant="primary" leftIcon={<Plus />} onClick={handleAddAsset}>
                            Add Asset
                          </Button>
                        </div>
                      </Inline>
                    </CardHeader>

                    <CardBody className="space-y-4">
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={handleAddAsset} />
                        ) : (
                          <HoldingsTable
                            holdings={visibleHoldings}
                            onSort={triggerSort}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onRemove={setConfirmRemoveId}
                            flash={flashPrices}
                          />
                        )}
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={handleAddAsset} />
                        ) : (
                          <div className="space-y-3">
                            {visibleHoldings.map(h => (
                              <HoldingsMobileCard
                                key={h.id}
                                holding={h}
                                onRemove={setConfirmRemoveId}
                                flash={flashPrices}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </section>
        </Stack>
      </Container>

      {/* Confirm remove dialog */}
      <Modal
        open={confirmRemoveId !== null}
        onOpenChange={open => {
          if (!open) setConfirmRemoveId(null);
        }}
        title="Remove holding?"
        description="This will remove the position from your dashboard. You can add it again later."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRemoveId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmRemoveId) {
                  removeHoldingMutation.mutate(confirmRemoveId);
                }
                setConfirmRemoveId(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <Text as="p" size="sm" tone="muted">
          Think of this like removing a sticky note from your desk: it doesn't change the company,
          it just clears your view.
        </Text>
      </Modal>

      <AddAssetModal open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen} />
      <AddWatchlistModal open={isAddWatchlistOpen} onOpenChange={setIsAddWatchlistOpen} />
    </AppShell>
  );
}
