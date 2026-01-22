import { useCallback, useMemo, useState } from 'react';
import { Container, Stack } from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';
import { useMarketNews } from './hooks/useMarketNews';
import { useCompanyNews } from './hooks/useCompanyNews';
import { usePortfolioHoldings } from '@/features/portfolio/hooks/usePortfolioHoldings';
import { usePortfolioWatchlist } from '@/features/portfolio/hooks/usePortfolioWatchlist';
import { MarketNewsSection } from './components/MarketNewsSection';
import { CompanyNewsSection } from './components/CompanyNewsSection';

/**
 * News page displaying market headlines and company-specific news.
 */
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

          <MarketNewsSection
            data={marketNews.data}
            isLoading={marketNews.isLoading}
            isError={marketNews.isError}
            error={marketNews.error}
            onRetry={() => void marketNews.refetch()}
          />

          <CompanyNewsSection
            symbols={companySymbols}
            newsBySymbol={companyNews.newsBySymbol}
            newsCount={companyNewsCount}
            isLoading={companyNews.isLoading}
            isError={companyNews.isError}
            error={companyNews.error}
            onRetry={() => void companyNews.refetch()}
          />
        </Stack>
      </Container>
    </AppShell>
  );
}
