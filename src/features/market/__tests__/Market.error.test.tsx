import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import { Market } from '../Market';

vi.mock('../hooks/useMarketQuotes', () => ({
  useMarketQuotes: () => ({
    data: [],
    isLoading: false,
    isError: true,
    dataUpdatedAt: 0,
  }),
}));

vi.mock('../hooks/useEarningsCalendar', () => ({
  useEarningsCalendar: () => ({
    data: [],
    isLoading: false,
    isError: true,
    error: new Error('fail'),
    dataUpdatedAt: 0,
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
    expect(screen.getByText('Unable to load index data right now.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load sector data right now.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load earnings calendar right now.')).toBeInTheDocument();
  });
});
