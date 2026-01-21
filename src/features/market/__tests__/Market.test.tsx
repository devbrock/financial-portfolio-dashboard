import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { Market } from '../Market';
import { screen } from '@testing-library/react';

const mockUseMarketQuotes = vi.fn();
const mockUseEarningsCalendar = vi.fn();

vi.mock('../hooks/useMarketQuotes', () => ({
  useMarketQuotes: (items: unknown) => mockUseMarketQuotes(items),
}));

vi.mock('../hooks/useEarningsCalendar', () => ({
  useEarningsCalendar: (days: number) => mockUseEarningsCalendar(days),
}));

vi.mock('@/features/portfolio/hooks/useCurrencyFormatter', () => ({
  useCurrencyFormatter: () => ({
    formatMoney: (value: number) => `$${value.toFixed(2)}`,
    formatCompactMoney: (value: number) => `$${value.toFixed(2)}`,
  }),
}));

type MarketQuotesState = {
  data: Array<{ symbol: string; name: string; quote?: { c: number; dp: number } }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dataUpdatedAt: number;
  refetch: () => Promise<unknown>;
};

type EarningsState = {
  data: Array<{
    date: string;
    symbol: string;
    hour: string;
    epsActual: number | null;
    epsEstimate: number | null;
    revenueActual: number | null;
    revenueEstimate: number | null;
  }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  dataUpdatedAt: number;
  refetch: () => Promise<unknown>;
};

const createQuotesState = (overrides: Partial<MarketQuotesState> = {}): MarketQuotesState => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  dataUpdatedAt: 0,
  refetch: vi.fn(async () => undefined),
  ...overrides,
});

const createEarningsState = (overrides: Partial<EarningsState> = {}): EarningsState => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  dataUpdatedAt: 0,
  refetch: vi.fn(async () => undefined),
  ...overrides,
});

describe('Market', () => {
  beforeEach(() => {
    mockUseMarketQuotes.mockReset();
    mockUseEarningsCalendar.mockReset();
  });

  it('renders error states for each section', () => {
    mockUseMarketQuotes
      .mockImplementationOnce(() => createQuotesState({ isError: true, error: new Error('oops') }))
      .mockImplementationOnce(() => createQuotesState({ isError: true, error: new Error('oops') }));
    mockUseEarningsCalendar.mockImplementation(() =>
      createEarningsState({ isError: true, error: new Error('oops') })
    );

    renderWithProviders(<Market />);

    expect(screen.getByText('Unable to load index data.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load sector data.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load the earnings calendar.')).toBeInTheDocument();
  });

  it('renders empty states for each section', () => {
    mockUseMarketQuotes
      .mockImplementationOnce(() => createQuotesState())
      .mockImplementationOnce(() => createQuotesState());
    mockUseEarningsCalendar.mockImplementation(() => createEarningsState());

    renderWithProviders(<Market />);

    expect(screen.getByText('No index data available.')).toBeInTheDocument();
    expect(screen.getByText('No sector data available.')).toBeInTheDocument();
    expect(screen.getByText('No earnings scheduled.')).toBeInTheDocument();
  });

  it('renders loading state for earnings', () => {
    mockUseMarketQuotes
      .mockImplementationOnce(() => createQuotesState({ data: [{ symbol: 'SPY', name: 'S&P 500' }] }))
      .mockImplementationOnce(() => createQuotesState({ data: [{ symbol: 'XLK', name: 'Tech' }] }));
    mockUseEarningsCalendar.mockImplementation(() => createEarningsState({ isLoading: true }));

    renderWithProviders(<Market />);

    expect(screen.queryByText('No earnings scheduled.')).not.toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Earnings calendar' })).not.toBeInTheDocument();
  });

  it('renders the earnings table when data is available', () => {
    mockUseMarketQuotes
      .mockImplementationOnce(() => createQuotesState({ data: [{ symbol: 'SPY', name: 'S&P 500' }] }))
      .mockImplementationOnce(() => createQuotesState({ data: [{ symbol: 'XLK', name: 'Tech' }] }));
    mockUseEarningsCalendar.mockImplementation(() =>
      createEarningsState({
        data: [
          {
            date: '2024-01-10',
            symbol: 'ACME',
            hour: 'bmo',
            epsActual: 1.2,
            epsEstimate: 1,
            revenueActual: 1200000,
            revenueEstimate: 1100000,
          },
          {
            date: '2024-01-11',
            symbol: 'NULL',
            hour: '',
            epsActual: null,
            epsEstimate: null,
            revenueActual: null,
            revenueEstimate: null,
          },
        ],
      })
    );

    renderWithProviders(<Market />);

    expect(screen.getByRole('table', { name: 'Earnings calendar' })).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });
});
