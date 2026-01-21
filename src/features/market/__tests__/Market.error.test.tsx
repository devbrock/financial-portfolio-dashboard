import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import { Market } from '../Market';

vi.mock('../hooks/useMarketQuotes', () => ({
  useMarketQuotes: () => ({
    data: [],
    isLoading: false,
    isError: true,
    error: new Error('fail'),
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/useEarningsCalendar', () => ({
  useEarningsCalendar: () => ({
    data: [],
    isLoading: false,
    isError: true,
    error: new Error('fail'),
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

describe('Market errors', () => {
  it('renders error placeholders when APIs fail', () => {
    renderWithProviders(<Market />);
    expect(screen.getByText('Unable to load index data.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load sector data.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load the earnings calendar.')).toBeInTheDocument();
  });
});
