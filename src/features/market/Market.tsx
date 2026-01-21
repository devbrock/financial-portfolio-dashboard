import { useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Skeleton,
  Stack,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Text,
} from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';
import { useMarketQuotes } from './hooks/useMarketQuotes';
import { useEarningsCalendar } from './hooks/useEarningsCalendar';
import { INDEX_SYMBOLS, SECTOR_SYMBOLS } from './marketData';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';
import { MarketQuoteRow, MarketQuoteTile } from './components/MarketQuotes';
import { formatDate, formatEarningsTime, formatUpdatedAt } from './marketFormatters';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

          <section aria-label="Major indices">
            <Card>
              <CardHeader>
                <Heading as="h3" className="text-lg">
                  Indices overview
                </Heading>
                <Text as="div" size="sm" tone="muted" className="text-right">
                  Hourly snapshots of key U.S. benchmarks
                </Text>
              </CardHeader>
              <CardBody>
                {indices.isError ? (
                  <StatusMessage
                    tone="danger"
                    title="Unable to load index data."
                    message={getErrorMessage(indices.error, 'Please try again in a moment.')}
                    actionLabel="Retry"
                    onAction={() => {
                      void indices.refetch();
                    }}
                  />
                ) : indices.data.length === 0 ? (
                  <StatusMessage
                    title="No index data available."
                    message="Check back later for the latest benchmarks."
                    className="border-dashed bg-transparent"
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {indices.data.map(item => (
                      <MarketQuoteTile
                        key={item.symbol}
                        name={item.name}
                        symbol={item.symbol}
                        quote={item.quote}
                        loading={indices.isLoading}
                      />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </section>

          <section aria-label="Sector performance">
            <Card>
              <CardHeader>
                <Heading as="h3" className="text-lg">
                  Sector snapshot
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Leadership view across sector ETFs
                </Text>
              </CardHeader>
              <CardBody>
                {sectors.isError ? (
                  <StatusMessage
                    tone="danger"
                    title="Unable to load sector data."
                    message={getErrorMessage(sectors.error, 'Please try again in a moment.')}
                    actionLabel="Retry"
                    onAction={() => {
                      void sectors.refetch();
                    }}
                  />
                ) : sectors.data.length === 0 ? (
                  <StatusMessage
                    title="No sector data available."
                    message="Check back later for the latest sector moves."
                    className="border-dashed bg-transparent"
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sectors.data.map(item => (
                      <MarketQuoteRow
                        key={item.symbol}
                        name={item.name}
                        symbol={item.symbol}
                        quote={item.quote}
                        loading={sectors.isLoading}
                      />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </section>

          <section aria-label="Earnings calendar">
            <Card>
              <CardHeader>
                <Heading as="h3" className="text-lg">
                  Earnings calendar
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Upcoming results in the next 7 days
                </Text>
              </CardHeader>
              <CardBody>
                {earnings.isError ? (
                  <StatusMessage
                    tone="danger"
                    title="Unable to load the earnings calendar."
                    message={getErrorMessage(earnings.error, 'Please try again in a moment.')}
                    actionLabel="Retry"
                    onAction={() => {
                      void earnings.refetch();
                    }}
                  />
                ) : earnings.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : earnings.data.length === 0 ? (
                  <StatusMessage
                    title="No earnings scheduled."
                    message="Check back later for upcoming results."
                    className="border-dashed bg-transparent"
                  />
                ) : (
                  <Table tableProps={{ 'aria-label': 'Earnings calendar' }}>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell>Date</TableHeadCell>
                        <TableHeadCell>Symbol</TableHeadCell>
                        <TableHeadCell>Time</TableHeadCell>
                        <TableHeadCell>EPS (Actual / Est.)</TableHeadCell>
                        <TableHeadCell>Revenue (Actual / Est.)</TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {earnings.data.slice(0, 10).map(item => (
                        <TableRow key={`${item.symbol}-${item.date}`}>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell className="font-semibold">{item.symbol}</TableCell>
                          <TableCell>{formatEarningsTime(item.hour)}</TableCell>
                          <TableCell>
                            {item.epsActual == null && item.epsEstimate == null
                              ? '--'
                              : `${item.epsActual == null ? '--' : formatMoney(item.epsActual)} / ${item.epsEstimate == null ? '--' : formatMoney(item.epsEstimate)}`}
                          </TableCell>
                          <TableCell>
                            {item.revenueActual == null && item.revenueEstimate == null
                              ? '--'
                              : `${item.revenueActual == null ? '--' : formatCompactMoney(item.revenueActual)}` +
                                ` / ${item.revenueEstimate == null ? '--' : formatCompactMoney(item.revenueEstimate)}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </section>
        </Stack>
      </Container>
    </AppShell>
  );
}
