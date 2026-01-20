import { useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  DeltaPill,
  Heading,
  Inline,
  Skeleton,
  Stack,
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
import { formatSignedPct } from '@/utils/formatSignedPct';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';

const formatUpdatedAt = (timestamp: number) => {
  if (!timestamp) return 'Updated: --';
  const formatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
  return `Updated at ${formatted}`;
};

const formatEarningsTime = (value?: string | null) => {
  if (!value) return '--';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bmo') return 'Before open';
  if (normalized === 'amc') return 'After close';
  return value;
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};

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
                <Heading as="h3" className="text-base">
                  Indices overview
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Hourly snapshots of key U.S. benchmarks
                </Text>
              </CardHeader>
              <CardBody>
                {indices.isError ? (
                  <Text as="div" size="sm" tone="muted">
                    Unable to load index data right now.
                  </Text>
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
                <Heading as="h3" className="text-base">
                  Sector snapshot
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Leadership view across sector ETFs
                </Text>
              </CardHeader>
              <CardBody>
                {sectors.isError ? (
                  <Text as="div" size="sm" tone="muted">
                    Unable to load sector data right now.
                  </Text>
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
                <Heading as="h3" className="text-base">
                  Earnings calendar
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Upcoming results in the next 7 days
                </Text>
              </CardHeader>
              <CardBody>
                {earnings.isError ? (
                  <Text as="div" size="sm" tone="muted">
                    Unable to load earnings calendar right now.
                  </Text>
                ) : earnings.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : earnings.data.length === 0 ? (
                  <Text as="div" size="sm" tone="muted">
                    No earnings scheduled for this period.
                  </Text>
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

function MarketQuoteTile(props: {
  name: string;
  symbol: string;
  quote?: { c: number; dp: number };
  loading: boolean;
}) {
  const { name, symbol, quote, loading } = props;
  const { formatMoney } = useCurrencyFormatter();

  return (
    <div className="rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-4">
      <Inline align="center" justify="between" className="gap-2">
        <div>
          <Text as="div" className="text-sm font-semibold">
            {name}
          </Text>
          <Text as="div" size="sm" tone="muted">
            {symbol}
          </Text>
        </div>
        {loading ? <Skeleton className="h-8 w-20" /> : null}
      </Inline>
      {!loading ? (
        quote ? (
          <Inline align="end" justify="between" className="mt-4 gap-2">
            <Text as="div" className="text-xl font-semibold">
              {formatMoney(quote.c)}
            </Text>
            <DeltaPill
              direction={quote.dp > 0 ? 'up' : quote.dp < 0 ? 'down' : 'flat'}
              tone={quote.dp > 0 ? 'success' : quote.dp < 0 ? 'danger' : 'neutral'}
            >
              {formatSignedPct(quote.dp)}
            </DeltaPill>
          </Inline>
        ) : (
          <Text as="div" size="sm" tone="muted" className="mt-4">
            Data unavailable
          </Text>
        )
      ) : null}
    </div>
  );
}

function MarketQuoteRow(props: {
  name: string;
  symbol: string;
  quote?: { c: number; dp: number };
  loading: boolean;
}) {
  const { name, symbol, quote, loading } = props;
  const { formatMoney } = useCurrencyFormatter();

  return (
    <div className="flex items-center justify-between rounded-2xl border border-(--ui-border) bg-(--ui-bg) px-4 py-3">
      <div>
        <Text as="div" className="text-sm font-semibold">
          {name}
        </Text>
        <Text as="div" size="sm" tone="muted">
          {symbol}
        </Text>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : quote ? (
        <Inline align="center" className="gap-3">
          <Text as="div" className="text-sm font-semibold">
            {formatMoney(quote.c)}
          </Text>
          <DeltaPill
            direction={quote.dp > 0 ? 'up' : quote.dp < 0 ? 'down' : 'flat'}
            tone={quote.dp > 0 ? 'success' : quote.dp < 0 ? 'danger' : 'neutral'}
          >
            {formatSignedPct(quote.dp)}
          </DeltaPill>
        </Inline>
      ) : (
        <Text as="div" size="sm" tone="muted">
          --
        </Text>
      )}
    </div>
  );
}
