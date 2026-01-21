import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithProviders } from '@/test/test-utils';
import { Market } from '../Market';

vi.mock('../hooks/useMarketQuotes', () => ({
  useMarketQuotes: () => ({
    data: [{ symbol: 'SPY', name: 'S&P 500', quote: { c: 450, dp: 1.2 } }],
    isLoading: false,
    isError: false,
    error: null,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/useEarningsCalendar', () => ({
  useEarningsCalendar: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/portfolio/hooks/useCurrencyFormatter', () => ({
  useCurrencyFormatter: () => ({
    formatMoney: (value: number) => `$${value.toFixed(2)}`,
    formatCompactMoney: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

describe('Market accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const { container } = renderWithProviders(<Market />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
