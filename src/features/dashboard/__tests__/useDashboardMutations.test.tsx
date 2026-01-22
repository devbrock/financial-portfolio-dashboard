import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDashboardMutations } from '../hooks/useDashboardMutations';
import { createTestWrapper, createTestStore } from '@/test/test-utils';
import type { PortfolioState } from '@/types/portfolio';
import * as portfolioApi from '@/services/api/functions/portfolioApi';

// Mock the portfolio API functions
vi.mock('@/services/api/functions/portfolioApi', () => ({
  removeHoldingFromPortfolio: vi.fn(),
  removeWatchlistItemFromPortfolio: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

/**
 * Tests for useDashboardMutations hook.
 * Covers optimistic updates, error rollback, and success paths.
 */
describe('useDashboardMutations', () => {
  const mockRemoveHolding = vi.mocked(portfolioApi.removeHoldingFromPortfolio);
  const mockRemoveWatchlist = vi.mocked(portfolioApi.removeWatchlistItemFromPortfolio);
  const mockToast = vi.mocked(toast);

  const baseHolding = {
    id: 'hold-1',
    symbol: 'AAPL',
    assetType: 'stock' as const,
    quantity: 10,
    purchasePrice: 150,
    purchaseDate: '2024-01-01',
  };

  const baseWatchlistItem = {
    id: 'watch-1',
    symbol: 'GOOGL',
    assetType: 'stock' as const,
  };

  const createPreloadedState = (): { portfolio: PortfolioState } => ({
    portfolio: {
      holdings: [baseHolding],
      watchlist: [baseWatchlistItem],
      preferences: {
        theme: 'light',
        currency: 'USD',
        chartRange: '30d',
        sidebarOpen: true,
        sortPreference: { key: 'name', direction: 'asc' },
        notifications: {
          enabled: false,
          thresholdPct: 5,
          permissionStatus: 'default',
        },
      },
      userSeed: { seed: 'test-seed', initialized: true },
      historicalCache: { stocks: {} },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to successful operations
    mockRemoveHolding.mockResolvedValue('hold-1');
    mockRemoveWatchlist.mockResolvedValue('watch-1');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('removeHolding', () => {
    it('removes holding and calls API on success', async () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      expect(store.getState().portfolio.holdings).toHaveLength(1);

      act(() => {
        result.current.removeHolding('hold-1');
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(mockRemoveHolding).toHaveBeenCalled();
      });

      // Holding should be removed
      await waitFor(() => {
        expect(store.getState().portfolio.holdings).toHaveLength(0);
      });

      // Success toast should be shown
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Asset removed from your portfolio.');
      });
    });

    it('rolls back and shows error toast on API error', async () => {
      // Make API fail
      mockRemoveHolding.mockRejectedValue(new Error('Server error'));

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      act(() => {
        result.current.removeHolding('hold-1');
      });

      // Wait for error to be handled
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to remove the asset. Please try again.'
        );
      });

      // After error, holding should be restored (rollback)
      expect(store.getState().portfolio.holdings).toHaveLength(1);
      expect(store.getState().portfolio.holdings[0].id).toBe('hold-1');
    });

    it('does not remove non-existent holding', async () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      act(() => {
        result.current.removeHolding('non-existent-id');
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(mockRemoveHolding).toHaveBeenCalled();
      });

      // Original holding should still exist
      expect(store.getState().portfolio.holdings).toHaveLength(1);
    });
  });

  describe('removeWatchlist', () => {
    it('removes watchlist item and calls API on success', async () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      expect(store.getState().portfolio.watchlist).toHaveLength(1);

      act(() => {
        result.current.removeWatchlist('watch-1');
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(mockRemoveWatchlist).toHaveBeenCalled();
      });

      // Item should be removed
      await waitFor(() => {
        expect(store.getState().portfolio.watchlist).toHaveLength(0);
      });

      // Success toast should be shown
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Removed from your watchlist.');
      });
    });

    it('rolls back and shows error toast on API error', async () => {
      // Make API fail
      mockRemoveWatchlist.mockRejectedValue(new Error('Server error'));

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      act(() => {
        result.current.removeWatchlist('watch-1');
      });

      // Wait for error to be handled
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to remove the watchlist item. Please try again.'
        );
      });

      // After error, item should be restored (rollback)
      expect(store.getState().portfolio.watchlist).toHaveLength(1);
      expect(store.getState().portfolio.watchlist[0].id).toBe('watch-1');
    });

    it('does not remove non-existent watchlist item', async () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardMutations(), { wrapper });

      act(() => {
        result.current.removeWatchlist('non-existent-id');
      });

      // Wait for mutation to complete
      await waitFor(() => {
        expect(mockRemoveWatchlist).toHaveBeenCalled();
      });

      // Original item should still exist
      expect(store.getState().portfolio.watchlist).toHaveLength(1);
    });
  });
});
