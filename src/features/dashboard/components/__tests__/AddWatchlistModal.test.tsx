import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddWatchlistModal } from '../AddWatchlistModal';
import { renderWithProviders, createTestStore } from '@/test/test-utils';
import { addWatchlistItem } from '@/features/portfolio/portfolioSlice';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { useCryptoSearch } from '@/hooks/useCryptoSearch';
import { toast } from 'sonner';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FinnhubSymbolLookup } from '@/types/finnhub';
import type { CoinGeckoSearchResponse } from '@/types/coinGecko';

vi.mock('@/hooks/useSymbolSearch', () => ({
  useSymbolSearch: vi.fn(),
}));

vi.mock('@/hooks/useCryptoSearch', () => ({
  useCryptoSearch: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseSymbolSearch = vi.mocked(useSymbolSearch);
const mockUseCryptoSearch = vi.mocked(useCryptoSearch);
const mockToast = toast as unknown as {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

const stockResults = {
  count: 1,
  result: [
    {
      symbol: 'AAPL',
      displaySymbol: 'AAPL',
      description: 'Apple Inc.',
    },
  ],
};

const cryptoResults = {
  coins: [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
    },
  ],
};

describe('AddWatchlistModal', () => {
  beforeEach(() => {
    mockUseSymbolSearch.mockReturnValue({
      data: stockResults,
      isFetching: false,
    } as UseQueryResult<FinnhubSymbolLookup, Error>);
    mockUseCryptoSearch.mockReturnValue({
      data: cryptoResults,
      isFetching: false,
    } as UseQueryResult<CoinGeckoSearchResponse, Error>);
    mockToast.success.mockClear();
    mockToast.error.mockClear();
  });

  it('adds a stock to the watchlist', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { store } = renderWithProviders(
      <AddWatchlistModal open onOpenChange={onOpenChange} />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search RBLX, Adobe, BTC, Ethereum...'
    );
    await user.type(searchInput, 'AA');

    const option = await screen.findByText('Stock · AAPL — Apple Inc.');
    await user.click(option);

    await user.click(screen.getByRole('button', { name: 'Add to Watchlist' }));

    await waitFor(() => {
      const watchlist = store.getState().portfolio.watchlist;
      expect(watchlist.some(item => item.symbol === 'AAPL')).toBe(true);
    });
    expect(mockToast.success).toHaveBeenCalledWith('Added to watchlist.');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds a crypto to the watchlist with normalized symbol', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { store } = renderWithProviders(
      <AddWatchlistModal open onOpenChange={onOpenChange} />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search RBLX, Adobe, BTC, Ethereum...'
    );
    await user.type(searchInput, 'bit');

    const option = await screen.findByText('Crypto · BTC — Bitcoin');
    await user.click(option);

    await user.click(screen.getByRole('button', { name: 'Add to Watchlist' }));

    await waitFor(() => {
      const watchlist = store.getState().portfolio.watchlist;
      expect(watchlist.some(item => item.symbol === 'bitcoin')).toBe(true);
    });
    expect(mockToast.success).toHaveBeenCalledWith('Added to watchlist.');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables submission for duplicate assets', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(
      addWatchlistItem({
        id: 'existing',
        symbol: 'AAPL',
        assetType: 'stock',
      })
    );

    renderWithProviders(<AddWatchlistModal open onOpenChange={() => undefined} />, {
      store,
    });

    const searchInput = screen.getByPlaceholderText(
      'Search RBLX, Adobe, BTC, Ethereum...'
    );
    await user.type(searchInput, 'AA');

    const option = await screen.findByText('Stock · AAPL — Apple Inc.');
    await user.click(option);

    expect(
      await screen.findByText('This asset is already in your watchlist.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Watchlist' })).toBeDisabled();
  });

  it('shows validation error when no asset is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddWatchlistModal open onOpenChange={() => undefined} />);

    await user.click(screen.getByRole('button', { name: 'Add to Watchlist' }));

    expect(
      await screen.findByText('Select an asset from search')
    ).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith(
      'Select an asset to add to your watchlist.'
    );
  });
});
