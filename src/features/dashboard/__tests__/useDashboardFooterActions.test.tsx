import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardFooterActions } from '../hooks/useDashboardFooterActions';
import { createTestWrapper, createTestStore } from '@/test/test-utils';
import type { PortfolioState } from '@/types/portfolio';
import * as exportCSV from '@/utils/exportCSV';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock portfolio hooks
const mockPortfolioData = {
  holdingsWithPrice: [],
  metrics: {
    totalValue: 1000,
    totalCostBasis: 900,
    totalPL: 100,
    totalPLPct: 10,
    stockValue: 600,
    cryptoValue: 400,
    stockPct: 60,
    cryptoPct: 40,
  },
};

const mockHistoricalData = {
  data: [
    { date: '2024-01-01', value: 900 },
    { date: '2024-01-02', value: 1000 },
  ],
};

vi.mock('@/features/portfolio/hooks/usePortfolioData', () => ({
  usePortfolioData: () => mockPortfolioData,
}));

vi.mock('@/features/portfolio/hooks/usePortfolioHistoricalData', () => ({
  usePortfolioHistoricalData: () => mockHistoricalData,
}));

vi.mock('@/features/portfolio/hooks/useCurrencyFormatter', () => ({
  useCurrencyFormatter: () => ({ rate: 1, format: (v: number) => `$${v}` }),
}));

// Mock useNotifications
const mockToggleNotifications = vi.fn();
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    enabled: false,
    permissionStatus: 'default',
    toggleNotifications: mockToggleNotifications,
  }),
}));

// Mock exportCSV
vi.mock('@/utils/exportCSV', () => ({
  exportPortfolioReportCSV: vi.fn(),
}));

/**
 * Tests for useDashboardFooterActions hook.
 * Covers theme/currency changes, export, logout, and notification toggles.
 */
describe('useDashboardFooterActions', () => {
  const mockExportCSV = vi.mocked(exportCSV.exportPortfolioReportCSV);

  const createPreloadedState = (): { portfolio: PortfolioState } => ({
    portfolio: {
      holdings: [],
      watchlist: [],
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
    mockToggleNotifications.mockResolvedValue(undefined);
  });

  describe('theme changes', () => {
    it('returns current theme from store', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      expect(result.current.theme).toBe('light');
    });

    it('updates theme preference', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onThemeChange('dark');
      });

      expect(store.getState().portfolio.preferences.theme).toBe('dark');
    });
  });

  describe('currency changes', () => {
    it('returns current currency from store', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      expect(result.current.currency).toBe('USD');
    });

    it('updates currency preference', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onCurrencyChange('EUR');
      });

      expect(store.getState().portfolio.preferences.currency).toBe('EUR');
    });

    it('supports all currency options', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      const currencies = ['USD', 'EUR', 'GBP', 'JPY'] as const;

      for (const curr of currencies) {
        act(() => {
          result.current.onCurrencyChange(curr);
        });
        expect(store.getState().portfolio.preferences.currency).toBe(curr);
      }
    });
  });

  describe('logout', () => {
    it('dispatches logout and navigates to login', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onLogout();
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
  });

  describe('export', () => {
    it('calls exportPortfolioReportCSV with correct data', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onExport();
      });

      expect(mockExportCSV).toHaveBeenCalledTimes(1);
      expect(mockExportCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
          rangeLabel: '30d',
          rate: 1,
          performance: mockHistoricalData.data,
          allocation: expect.any(Array),
          holdings: expect.any(Array),
        })
      );
    });

    it('includes allocation slices based on metrics', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onExport();
      });

      const callArgs = mockExportCSV.mock.calls[0][0];
      expect(callArgs.allocation).toEqual([
        { name: 'Stocks', valuePct: 60 },
        { name: 'Crypto', valuePct: 40 },
      ]);
    });
  });

  describe('notifications', () => {
    it('calls toggleNotifications when toggling', async () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      act(() => {
        result.current.onToggleNotifications();
      });

      await waitFor(() => {
        expect(mockToggleNotifications).toHaveBeenCalled();
      });
    });

    it('exposes notification state', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useDashboardFooterActions(), { wrapper });

      expect(result.current.notificationsEnabled).toBe(false);
      expect(result.current.notificationPermission).toBe('default');
    });
  });
});
