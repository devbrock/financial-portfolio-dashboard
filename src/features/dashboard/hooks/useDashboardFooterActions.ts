import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';
import { logoutUser } from '@/features/auth/authSlice';
import { usePortfolioData } from '@/features/portfolio/hooks/usePortfolioData';
import { usePortfolioHistoricalData } from '@/features/portfolio/hooks/usePortfolioHistoricalData';
import { exportPortfolioReportCSV } from '@/utils/exportCSV';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';

type Theme = 'light' | 'dark';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

/**
 * useDashboardFooterActions
 * Shared settings/export/logout actions for sidebar and mobile nav.
 */
export function useDashboardFooterActions() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.portfolio.preferences.theme);
  const currency = useAppSelector(state => state.portfolio.preferences.currency);
  const chartRange = useAppSelector(state => state.portfolio.preferences.chartRange);
  const { holdingsWithPrice, metrics } = usePortfolioData();
  const { data: performanceData } = usePortfolioHistoricalData(chartRange);
  const { rate } = useCurrencyFormatter();

  const onThemeChange = useCallback(
    (nextTheme: Theme) => {
      dispatch(updatePreferences({ theme: nextTheme }));
    },
    [dispatch]
  );

  const onCurrencyChange = useCallback(
    (nextCurrency: Currency) => {
      dispatch(updatePreferences({ currency: nextCurrency }));
    },
    [dispatch]
  );

  const onLogout = useCallback(() => {
    dispatch(logoutUser());
    navigate({ to: '/login' });
  }, [dispatch, navigate]);

  const onExport = useCallback(() => {
    const allocation = [
      ...(metrics.stockPct > 0 ? [{ name: 'Stocks', valuePct: metrics.stockPct }] : []),
      ...(metrics.cryptoPct > 0 ? [{ name: 'Crypto', valuePct: metrics.cryptoPct }] : []),
    ];

    const holdings = holdingsWithPrice.map(holding => ({
      symbol: holding.symbol.toUpperCase(),
      name: holding.companyName ?? holding.symbol,
      quantity: holding.quantity,
      purchasePrice: holding.purchasePrice,
      currentPrice: holding.currentPrice,
      totalValue: holding.currentPrice * holding.quantity,
      pnl: holding.plUsd,
      purchaseDate: holding.purchaseDate,
    }));

    exportPortfolioReportCSV({
      generatedAt: new Date().toISOString(),
      currency,
      rangeLabel: chartRange,
      rate,
      performance: performanceData,
      allocation,
      holdings,
    });
  }, [chartRange, currency, holdingsWithPrice, metrics, performanceData, rate]);

  return {
    theme,
    currency,
    onThemeChange,
    onCurrencyChange,
    onExport,
    onLogout,
  };
}
