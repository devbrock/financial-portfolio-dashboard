import { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Inline,
  Skeleton,
  Stack,
  StatusMessage,
  Text,
} from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';
import { useMarketNews } from './hooks/useMarketNews';
import { useCompanyNews } from './hooks/useCompanyNews';
import { usePortfolioHoldings } from '@/features/portfolio/hooks/usePortfolioHoldings';
import { usePortfolioWatchlist } from '@/features/portfolio/hooks/usePortfolioWatchlist';
import type { FinnhubNewsItem } from '@/types/finnhub';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function News() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const handleNavChange = useCallback(
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => navigate({ to: DASHBOARD_NAV_ROUTES[next] }),
    [navigate]
  );

  const holdings = usePortfolioHoldings();
  const watchlist = usePortfolioWatchlist();
  const [range] = useState(() => {
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 7);
    const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
    return { from: toDateKey(start), to: toDateKey(end) };
  });

  const companySymbols = useMemo(() => {
    const raw = [
      ...holdings.filter(h => h.assetType === 'stock').map(h => h.symbol.toUpperCase()),
      ...watchlist.filter(w => w.assetType === 'stock').map(w => w.symbol.toUpperCase()),
    ];
    return Array.from(new Set(raw)).slice(0, 8);
  }, [holdings, watchlist]);

  const marketNews = useMarketNews('general');
  const companyNews = useCompanyNews(companySymbols, range.from, range.to);
  const companyNewsCount = useMemo(() => {
    let count = 0;
    companySymbols.forEach(symbol => {
      count += companyNews.newsBySymbol.get(symbol)?.length ?? 0;
    });
    return count;
  }, [companyNews.newsBySymbol, companySymbols]);

  return (
    <AppShell activeNav={activeNav} onNavChange={handleNavChange}>
      <Container className="max-w-none px-0">
        <Stack gap="lg">
          <PageHeader
            title="News"
            subtitle="Market headlines plus updates tied to your holdings and watchlist."
          />

          <section aria-label="Market news">
            <Card>
              <CardHeader>
                <Heading as="h2" className="text-base">
                  Market headlines
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Latest broad-market stories
                </Text>
              </CardHeader>
              <CardBody>
                {marketNews.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : marketNews.isError ? (
                  <StatusMessage
                    tone="danger"
                    title="Unable to load market news."
                    message={getErrorMessage(marketNews.error, 'Please try again in a moment.')}
                    actionLabel="Retry"
                    onAction={() => {
                      void marketNews.refetch();
                    }}
                  />
                ) : marketNews.data.length === 0 ? (
                  <StatusMessage
                    title="No market headlines yet."
                    message="Check back later for the latest stories."
                    className="border-dashed bg-transparent"
                  />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {marketNews.data.slice(0, 6).map(item => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </section>

          <section aria-label="Company news">
            <Card>
              <CardHeader>
                <Heading as="h2" className="text-base">
                  Company news
                </Heading>
                <Text as="div" size="sm" tone="muted">
                  Updates for your holdings and watchlist
                </Text>
              </CardHeader>
              <CardBody className="space-y-4">
                {companySymbols.length === 0 ? (
                  <StatusMessage
                    title="Follow a company to see updates."
                    message="Add stock holdings or watchlist symbols to personalize this feed."
                    className="border-dashed bg-transparent"
                  />
                ) : companyNews.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : companyNews.isError ? (
                  <StatusMessage
                    tone="danger"
                    title="Unable to load company news."
                    message={getErrorMessage(companyNews.error, 'Please try again in a moment.')}
                    actionLabel="Retry"
                    onAction={() => {
                      void companyNews.refetch();
                    }}
                  />
                ) : companyNewsCount === 0 ? (
                  <StatusMessage
                    title="No company news yet."
                    message="We'll show updates as soon as new stories are published."
                    className="border-dashed bg-transparent"
                  />
                ) : (
                  companySymbols.map(symbol => (
                    <div key={symbol} className="space-y-4">
                      <Inline align="center" justify="between" className="pt-4 pb-2">
                        <Heading as="h3" className="text-base">
                          {symbol}
                        </Heading>
                        <Text as="div" size="sm" tone="muted">
                          Last 7 days
                        </Text>
                      </Inline>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {(companyNews.newsBySymbol.get(symbol) ?? []).slice(0, 4).map(item => (
                          <NewsCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </section>
        </Stack>
      </Container>
    </AppShell>
  );
}

function formatNewsTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function NewsCard({ item }: { item: FinnhubNewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-4 rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-shadow duration-200 hover:border-(--ui-primary) hover:shadow-sm motion-reduce:transition-none"
    >
      {item.image ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-(--ui-surface)">
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="min-w-0">
        <Text as="div" className="line-clamp-2 text-sm font-semibold">
          {item.headline}
        </Text>
        <Text as="div" size="sm" tone="muted" className="mt-1 line-clamp-2">
          {item.summary}
        </Text>
        <Inline align="center" className="mt-2 gap-2 text-xs text-(--ui-text-muted)">
          <span>{item.source}</span>
          <span aria-hidden="true">•</span>
          <span>{formatNewsTime(item.datetime)}</span>
        </Inline>
      </div>
    </a>
  );
}
