import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { Dashboard } from '../Dashboard';

const mockUseDashboardData = vi.fn();

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

describe('Dashboard accessibility', () => {
  it('has no basic accessibility violations', async () => {
    mockUseDashboardData.mockReturnValue({
      watchlist: [],
      allocation: [{ name: 'Stocks', value: 100, color: 'red' }],
      holdings: [],
      metrics: {
        totalValue: 1000,
        totalCostBasis: 900,
        totalPL: 100,
        totalPLPct: 10,
        stockValue: 1000,
        cryptoValue: 0,
        stockPct: 100,
        cryptoPct: 0,
      },
      dailyPlUsd: 3,
      dailyPlPct: 0.3,
      isLoading: false,
      isError: false,
      errorMessage: '',
      dataUpdatedAt: 0,
    });

    const { container } = renderWithProviders(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
