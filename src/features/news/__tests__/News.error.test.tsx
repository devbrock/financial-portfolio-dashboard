import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { screen } from '@testing-library/react';
import { News } from '../News';

vi.mock('../hooks/useMarketNews', () => ({
  useMarketNews: () => ({
    data: [],
    isLoading: false,
    isError: true,
    error: new Error('fail'),
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/useCompanyNews', () => ({
  useCompanyNews: () => ({
    newsBySymbol: new Map(),
    isLoading: false,
    isError: true,
    error: new Error('fail'),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/portfolio/hooks/usePortfolioHoldings', () => ({
  usePortfolioHoldings: () => [
    {
      id: '1',
      symbol: 'AAPL',
      assetType: 'stock',
      quantity: 1,
      purchasePrice: 100,
      purchaseDate: '2024-01-01',
    },
  ],
}));

vi.mock('@/features/portfolio/hooks/usePortfolioWatchlist', () => ({
  usePortfolioWatchlist: () => [],
}));

describe('News errors', () => {
  it('renders error states when news APIs fail', () => {
    renderWithProviders(<News />);
    expect(screen.getByText('Unable to load market news.')).toBeInTheDocument();
    expect(screen.getByText('Unable to load company news.')).toBeInTheDocument();
  });
});
