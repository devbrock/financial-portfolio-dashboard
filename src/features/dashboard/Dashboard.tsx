import { lazy, Suspense } from 'react';
import { Container, Stack } from '@components';
import {
  DashboardChartsSection,
  DashboardErrorBanner,
  DashboardHeader,
  DashboardHoldingsSection,
  DashboardRemoveModal,
  DashboardWatchlistSection,
} from './components';
import { AppShell } from '@/features/shell/AppShell';
import { useDashboardController } from './hooks/useDashboardController';

/**
 * Lazy-loaded modals to avoid shipping form validation schemas on initial load.
 */
const AddAssetModal = lazy(() =>
  import('./components/AddAssetModal').then(mod => ({ default: mod.AddAssetModal }))
);
const AddWatchlistModal = lazy(() =>
  import('./components/AddWatchlistModal').then(mod => ({ default: mod.AddWatchlistModal }))
);

export function Dashboard() {
  const {
    activeNav,
    handleNavChange,
    userName,
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
    metrics,
    dailyPlUsd,
    dailyPlPct,
    isError,
    errorMessage,
    liveMessage,
    errorAnnounce,
    visibleHoldings,
    handleRetry,
    removeHolding,
    removeWatchlist,
  } = useDashboardController();

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={handleNavChange}
      liveMessage={liveMessage}
      errorMessage={errorAnnounce}
    >
      <Container className="max-w-none px-0">
        <Stack gap="lg">
          {isError ? <DashboardErrorBanner message={errorMessage} onRetry={handleRetry} /> : null}

          <DashboardHeader
            userName={userName}
            portfolioValue={metrics.totalValue}
            lastUpdated={lastUpdatedSeconds}
            dailyChangeUsd={dailyPlUsd}
            dailyChangePct={dailyPlPct}
          />

          <DashboardWatchlistSection
            watchlist={watchlist}
            flashPrices={flashPrices}
            onAddWatchlist={handleAddWatchlist}
            onRemoveWatchlist={removeWatchlist}
          />

          <DashboardChartsSection
            range={range}
            onRangeChange={setRange}
            allocation={allocation}
            totalInvested={metrics.totalCostBasis}
            flashPrices={flashPrices}
          />

          <DashboardHoldingsSection
            holdingsQuery={holdingsQuery}
            onHoldingsQueryChange={setHoldingsQuery}
            onAddAsset={handleAddAsset}
            visibleHoldings={visibleHoldings}
            onSort={triggerSort}
            sortKey={sortKey}
            sortDir={sortDir}
            onRemove={setConfirmRemoveId}
            flashPrices={flashPrices}
          />
        </Stack>
      </Container>

      <DashboardRemoveModal
        open={confirmRemoveId !== null}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => {
          if (confirmRemoveId) {
            removeHolding(confirmRemoveId);
          }
          setConfirmRemoveId(null);
        }}
      />

      {isAddAssetOpen ? (
        <Suspense fallback={null}>
          <AddAssetModal open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen} />
        </Suspense>
      ) : null}
      {isAddWatchlistOpen ? (
        <Suspense fallback={null}>
          <AddWatchlistModal open={isAddWatchlistOpen} onOpenChange={setIsAddWatchlistOpen} />
        </Suspense>
      ) : null}
    </AppShell>
  );
}
