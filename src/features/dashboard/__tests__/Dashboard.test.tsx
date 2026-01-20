import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../Dashboard';
import { renderWithProviders } from '@/test/test-utils';
import type { AllocationSlice, HoldingRow, WatchlistCardModel } from '@/types/dashboard';
import { createTestStore } from '@/test/test-utils';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';

const baseWatchlist: WatchlistCardModel[] = [
  {
    id: '1',
    name: 'Watchlist One',
    ticker: 'W1',
    priceUsd: 100,
    changePct: 1.2,
  },
];
const baseHoldings: HoldingRow[] = [
  {
    id: '1',
    name: 'Alpha',
    ticker: 'ALP',
    date: 'January 1, 2024',
    volume: 10,
    changePct: 1.2,
    purchasePrice: 170,
    priceUsd: 190,
    pnlUsd: 100,
    status: 'active',
  },
  {
    id: '2',
    name: 'Beta',
    ticker: 'BET',
    date: 'January 2, 2024',
    volume: 5,
    changePct: -0.5,
    purchasePrice: 95,
    priceUsd: 90,
    pnlUsd: -50,
    status: 'active',
  },
];
const baseAllocation: AllocationSlice[] = [{ name: 'Stocks', value: 60, color: 'red' }];

const mockUseDashboardData = vi.fn();

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

const baseDashboardData = {
  watchlist: baseWatchlist,
  allocation: baseAllocation,
  holdings: baseHoldings,
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
};

beforeEach(() => {
  mockUseDashboardData.mockReturnValue(baseDashboardData);
});

describe('Dashboard', () => {
  it('renders the holdings section', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('My Holdings')).toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
  });

  it('shows empty state when holdings are filtered out', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByLabelText('Search holdings');
    await user.type(searchInput, 'Gamma');

    expect(screen.getAllByText('No holdings found').length).toBeGreaterThan(0);
  });

  it('updates sort direction when clicking the same header', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    const nameButton = screen.getByRole('button', { name: 'Name' });
    const nameHeader = nameButton.closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    await user.click(nameButton);
    const updatedHeader = nameButton.closest('th');
    expect(updatedHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('updates sort key across multiple columns', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    const headers = [
      'Purchase Date',
      'Volume',
      'Change',
      'Purchase Price',
      'Current Price',
      'Profit/Loss',
    ];

    for (const label of headers) {
      const button = screen.getByRole('button', { name: label });
      await user.click(button);
      const header = button.closest('th');
      expect(header).toHaveAttribute('aria-sort', 'ascending');
    }
  });

  it('renders dark theme styles when preference is dark', () => {
    const store = createTestStore();
    store.dispatch(updatePreferences({ theme: 'dark' }));

    const { container } = renderWithProviders(<Dashboard />, { store });
    const shell = container.querySelector('.h-screen');
    expect(shell).toHaveClass('bg-(--ui-bg)');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
