import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardData } from '../useDashboardData';

const mockUsePortfolioData = vi.fn();

vi.mock('@/features/portfolio/hooks/usePortfolioData', () => ({
  usePortfolioData: () => mockUsePortfolioData(),
}));

describe('useDashboardData', () => {
  it('maps holdings, watchlist, and allocation data', () => {
    mockUsePortfolioData.mockReturnValue({
      holdingsWithPrice: [
        {
          id: 'h1',
          symbol: 'aapl',
          assetType: 'stock',
          quantity: 2,
          purchasePrice: 100,
          purchaseDate: '2024-01-02',
          currentPrice: 150,
          currentValue: 300,
          plUsd: 100,
          plPct: 50,
          companyName: 'Apple',
        },
      ],
      watchlistWithPrice: [
        {
          id: 'w1',
          symbol: 'btc',
          assetType: 'crypto',
          currentPrice: 50000,
          changePct: 2.5,
        },
      ],
      metrics: {
        totalValue: 300,
        totalCostBasis: 200,
        totalPL: 100,
        totalPLPct: 50,
        stockValue: 300,
        cryptoValue: 0,
        stockPct: 100,
        cryptoPct: 0,
      },
      isLoading: false,
      isError: false,
      errorMessage: '',
      dataUpdatedAt: 123,
    });

    const { result } = renderHook(() => useDashboardData());
    const { holdings, watchlist, allocation, dailyPlPct } = result.current;

    expect(holdings[0]?.ticker).toBe('AAPL');
    expect(holdings[0]?.dateIso).toBe('2024-01-02');
    expect(watchlist[0]?.ticker).toBe('BTC');
    expect(allocation[0]?.name).toBe('Stocks');
    expect(dailyPlPct).toBeCloseTo(1.5, 2);
  });
});
