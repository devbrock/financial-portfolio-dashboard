import { useCallback, useMemo } from 'react';
import { Container, Stack, Text } from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';
import { useMarketQuotes } from './hooks/useMarketQuotes';
import { useEarningsCalendar } from './hooks/useEarningsCalendar';
import { INDEX_SYMBOLS, SECTOR_SYMBOLS } from './marketData';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';
import { formatUpdatedAt } from './marketFormatters';
import { IndicesSection } from './components/IndicesSection';
import { SectorsSection } from './components/SectorsSection';
import { EarningsSection } from './components/EarningsSection';

/**
 * Market overview page displaying indices, sectors, and earnings calendar.
 */
export function Market() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const handleNavChange = useCallback(
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => navigate({ to: DASHBOARD_NAV_ROUTES[next] }),
    [navigate]
  );

  const indices = useMarketQuotes(INDEX_SYMBOLS);
  const sectors = useMarketQuotes(SECTOR_SYMBOLS);
  const earnings = useEarningsCalendar(7);
  const { formatMoney, formatCompactMoney } = useCurrencyFormatter();

  const lastUpdatedAt = useMemo(
    () => Math.max(indices.dataUpdatedAt, sectors.dataUpdatedAt, earnings.dataUpdatedAt),
    [earnings.dataUpdatedAt, indices.dataUpdatedAt, sectors.dataUpdatedAt]
  );

  return (
    <AppShell activeNav={activeNav} onNavChange={handleNavChange}>
      <Container className="max-w-none px-0">
        <Stack gap="lg">
          <PageHeader
            title="Market overview"
            subtitle="Track major indices, sector leadership, and the upcoming earnings calendar."
            rightSlot={
              <Text as="div" size="sm" tone="muted">
                {formatUpdatedAt(lastUpdatedAt)}
              </Text>
            }
          />

          <IndicesSection
            data={indices.data}
            isLoading={indices.isLoading}
            isError={indices.isError}
            error={indices.error}
            onRetry={() => void indices.refetch()}
          />

          <SectorsSection
            data={sectors.data}
            isLoading={sectors.isLoading}
            isError={sectors.isError}
            error={sectors.error}
            onRetry={() => void sectors.refetch()}
          />

          <EarningsSection
            data={earnings.data}
            isLoading={earnings.isLoading}
            isError={earnings.isError}
            error={earnings.error}
            onRetry={() => void earnings.refetch()}
            formatMoney={formatMoney}
            formatCompactMoney={formatCompactMoney}
          />
        </Stack>
      </Container>
    </AppShell>
  );
}
