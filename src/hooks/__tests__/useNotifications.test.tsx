import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { createTestWrapper, createTestStore } from '@/test/test-utils';
import type { PortfolioState } from '@/types/portfolio';
import * as notificationsService from '@/services/notifications';

// Mock the notifications service
vi.mock('@/services/notifications', async importOriginal => {
  const actual = await importOriginal<typeof notificationsService>();
  return {
    ...actual,
    getNotificationPermission: vi.fn(() => 'default'),
    requestNotificationPermission: vi.fn(async () => 'granted'),
    processAndSendPriceAlerts: vi.fn(() => 0),
  };
});

/**
 * Tests for useNotifications hook.
 * Covers permission handling, toggle behavior, and price alert checking.
 */
describe('useNotifications', () => {
  const mockGetPermission = vi.mocked(notificationsService.getNotificationPermission);
  const mockRequestPermission = vi.mocked(notificationsService.requestNotificationPermission);
  const mockProcessAlerts = vi.mocked(notificationsService.processAndSendPriceAlerts);

  const createPreloadedState = (
    notificationPrefs?: PortfolioState['preferences']['notifications']
  ): { portfolio: PortfolioState } => ({
    portfolio: {
      holdings: [],
      watchlist: [],
      preferences: {
        theme: 'light',
        currency: 'USD',
        chartRange: '30d',
        sidebarOpen: true,
        sortPreference: { key: 'name', direction: 'asc' },
        notifications: notificationPrefs,
      },
      userSeed: { seed: 'test-seed', initialized: true },
      historicalCache: { stocks: {} },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPermission.mockReturnValue('default');
    mockRequestPermission.mockResolvedValue('granted');
    mockProcessAlerts.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('returns disabled when no notification preferences exist', () => {
      const store = createTestStore(createPreloadedState(undefined));
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.enabled).toBe(false);
      expect(result.current.thresholdPct).toBe(5); // DEFAULT_NOTIFICATION_THRESHOLD_PCT
      expect(result.current.permissionStatus).toBe('default');
    });

    it('returns stored preferences when they exist and browser matches', () => {
      // Browser permission matches stored preference
      mockGetPermission.mockReturnValue('granted');

      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 10,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.enabled).toBe(true);
      expect(result.current.thresholdPct).toBe(10);
      expect(result.current.permissionStatus).toBe('granted');
      expect(result.current.hasPermission).toBe(true);
    });

    it('syncs permission status with browser on mount when they differ', async () => {
      // Browser says granted, but stored says default
      mockGetPermission.mockReturnValue('granted');

      const store = createTestStore(
        createPreloadedState({
          enabled: false,
          thresholdPct: 5,
          permissionStatus: 'default', // Out of sync with browser
        })
      );
      const wrapper = createTestWrapper(store);

      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(store.getState().portfolio.preferences.notifications?.permissionStatus).toBe(
          'granted'
        );
      });
    });
  });

  describe('requestPermission', () => {
    it('requests permission and updates store', async () => {
      // Start with granted so the sync effect doesn't override our update
      mockGetPermission.mockReturnValue('granted');
      mockRequestPermission.mockResolvedValue('granted');

      const store = createTestStore(createPreloadedState({
        enabled: false,
        thresholdPct: 5,
        permissionStatus: 'default',
      }));
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      // Wait for initial sync
      await waitFor(() => {
        expect(store.getState().portfolio.preferences.notifications?.permissionStatus).toBe(
          'granted'
        );
      });

      // Now request permission explicitly
      let permission: NotificationPermission | 'unsupported' = 'default';
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe('granted');
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('handles denied permission', async () => {
      mockRequestPermission.mockResolvedValue('denied');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let permission: NotificationPermission | 'unsupported' = 'default';
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe('denied');
    });

    it('handles unsupported notifications', async () => {
      mockRequestPermission.mockResolvedValue('unsupported');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let permission: NotificationPermission | 'unsupported' = 'default';
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe('unsupported');
    });
  });

  describe('enableNotifications', () => {
    it('enables when permission already granted', async () => {
      mockGetPermission.mockReturnValue('granted');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.enableNotifications();
      });

      expect(success).toBe(true);
      expect(store.getState().portfolio.preferences.notifications?.enabled).toBe(true);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('requests permission when not granted', async () => {
      mockGetPermission.mockReturnValue('default');
      mockRequestPermission.mockResolvedValue('granted');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.enableNotifications();
      });

      expect(success).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(store.getState().portfolio.preferences.notifications?.enabled).toBe(true);
    });

    it('returns false when permission denied', async () => {
      mockGetPermission.mockReturnValue('default');
      mockRequestPermission.mockResolvedValue('denied');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.enableNotifications();
      });

      expect(success).toBe(false);
      expect(store.getState().portfolio.preferences.notifications?.enabled).not.toBe(true);
    });

    it('does not request permission when unsupported', async () => {
      mockGetPermission.mockReturnValue('unsupported');

      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.enableNotifications();
      });

      expect(success).toBe(false);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });
  });

  describe('disableNotifications', () => {
    it('disables notifications in store', () => {
      mockGetPermission.mockReturnValue('granted');
      
      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.disableNotifications();
      });

      expect(store.getState().portfolio.preferences.notifications?.enabled).toBe(false);
    });
  });

  describe('toggleNotifications', () => {
    it('disables when currently enabled', async () => {
      mockGetPermission.mockReturnValue('granted');
      
      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.toggleNotifications();
      });

      expect(store.getState().portfolio.preferences.notifications?.enabled).toBe(false);
    });

    it('enables when currently disabled', async () => {
      mockGetPermission.mockReturnValue('granted');

      const store = createTestStore(
        createPreloadedState({
          enabled: false,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.toggleNotifications();
      });

      expect(store.getState().portfolio.preferences.notifications?.enabled).toBe(true);
    });
  });

  describe('setThreshold', () => {
    it('updates threshold in store', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.setThreshold(15);
      });

      expect(store.getState().portfolio.preferences.notifications?.thresholdPct).toBe(15);
    });

    it('clamps threshold to minimum of 0.1', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.setThreshold(-5);
      });

      expect(store.getState().portfolio.preferences.notifications?.thresholdPct).toBe(0.1);
    });

    it('clamps threshold to maximum of 100', () => {
      const store = createTestStore(createPreloadedState());
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.setThreshold(150);
      });

      expect(store.getState().portfolio.preferences.notifications?.thresholdPct).toBe(100);
    });
  });

  describe('checkPriceAlerts', () => {
    it('returns 0 when notifications are disabled', () => {
      mockGetPermission.mockReturnValue('granted');
      
      const store = createTestStore(
        createPreloadedState({
          enabled: false,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let count = -1;
      act(() => {
        count = result.current.checkPriceAlerts([], []);
      });

      expect(count).toBe(0);
      expect(mockProcessAlerts).not.toHaveBeenCalled();
    });

    it('returns 0 when permission not granted', () => {
      mockGetPermission.mockReturnValue('denied');
      
      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 5,
          permissionStatus: 'denied',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let count = -1;
      act(() => {
        count = result.current.checkPriceAlerts([], []);
      });

      expect(count).toBe(0);
      expect(mockProcessAlerts).not.toHaveBeenCalled();
    });

    it('processes alerts when enabled and permitted', () => {
      mockProcessAlerts.mockReturnValue(3);
      mockGetPermission.mockReturnValue('granted');

      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let count = -1;
      act(() => {
        count = result.current.checkPriceAlerts([], []);
      });

      expect(count).toBe(3);
      expect(mockProcessAlerts).toHaveBeenCalled();
    });
  });

  describe('resetNotifiedSymbols', () => {
    it('clears the notified symbols set', () => {
      mockGetPermission.mockReturnValue('granted');
      
      const store = createTestStore(
        createPreloadedState({
          enabled: true,
          thresholdPct: 5,
          permissionStatus: 'granted',
        })
      );
      const wrapper = createTestWrapper(store);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      // This should not throw
      act(() => {
        result.current.resetNotifiedSymbols();
      });

      // Since we can't directly inspect the ref, we just verify it doesn't throw
      expect(result.current.resetNotifiedSymbols).toBeDefined();
    });
  });
});
