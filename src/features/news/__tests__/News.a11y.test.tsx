import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithProviders } from '@/test/test-utils';
import { News } from '../News';

vi.mock('../hooks/useMarketNews', () => ({
  useMarketNews: () => ({
    data: [
      {
        id: 1,
        datetime: 1704412800,
        headline: 'Market update',
        image: '',
        related: 'SPY',
        source: 'Example',
        summary: 'Summary text',
        url: 'https://example.com',
        category: 'general',
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/useCompanyNews', () => ({
  useCompanyNews: () => ({
    newsBySymbol: new Map([
      [
        'AAPL',
        [
          {
            id: 2,
            datetime: 1704412800,
            headline: 'Company update',
            image: '',
            related: 'AAPL',
            source: 'Example',
            summary: 'Summary text',
            url: 'https://example.com',
            category: 'company',
          },
        ],
      ],
    ]),
    isLoading: false,
    isError: false,
    error: null,
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

describe('News accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const { container } = renderWithProviders(<News />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
