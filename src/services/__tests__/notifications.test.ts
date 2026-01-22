import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendPriceAlertNotification,
  detectSignificantPriceChanges,
  processAndSendPriceAlerts,
  clearNotifiedSymbols,
  DEFAULT_NOTIFICATION_THRESHOLD_PCT,
  type PriceAlert,
} from '../notifications';
import type { WatchlistItemWithPrice } from '@/types/portfolio';

/**
 * Tests for the notifications service.
 * Covers permission handling, alert detection, and notification sending.
 */
describe('notifications service', () => {
  // Store original Notification
  const originalNotification = globalThis.Notification;

  // Track mock notification instances
  type MockNotificationInstance = {
    title: string;
    options?: NotificationOptions;
    close: ReturnType<typeof vi.fn>;
  };
  let mockNotificationInstances: MockNotificationInstance[] = [];

  // Create a proper mock Notification class
  class MockNotification {
    title: string;
    options?: NotificationOptions;
    close = vi.fn();

    constructor(title: string, options?: NotificationOptions) {
      this.title = title;
      this.options = options;
      mockNotificationInstances.push(this);
    }

    static permission: NotificationPermission = 'default';
    static requestPermission = vi.fn().mockResolvedValue('granted');
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockNotificationInstances = [];

    // Setup mock Notification
    globalThis.Notification = MockNotification as unknown as typeof Notification;
    MockNotification.permission = 'default';
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.Notification = originalNotification;
  });

  describe('DEFAULT_NOTIFICATION_THRESHOLD_PCT', () => {
    it('exports default threshold of 5', () => {
      expect(DEFAULT_NOTIFICATION_THRESHOLD_PCT).toBe(5);
    });
  });

  describe('isNotificationSupported', () => {
    it('returns true when Notification exists in window', () => {
      expect(isNotificationSupported()).toBe(true);
    });

    it('returns false when Notification does not exist', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Notification;
      expect(isNotificationSupported()).toBe(false);
      globalThis.Notification = MockNotification as unknown as typeof Notification;
    });
  });

  describe('getNotificationPermission', () => {
    it('returns current permission status', () => {
      MockNotification.permission = 'granted';
      expect(getNotificationPermission()).toBe('granted');
    });

    it('returns unsupported when Notification not available', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Notification;
      expect(getNotificationPermission()).toBe('unsupported');
      globalThis.Notification = MockNotification as unknown as typeof Notification;
    });

    it('returns denied when permission is denied', () => {
      MockNotification.permission = 'denied';
      expect(getNotificationPermission()).toBe('denied');
    });
  });

  describe('requestNotificationPermission', () => {
    it('returns unsupported when Notification not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Notification;
      const result = await requestNotificationPermission();
      expect(result).toBe('unsupported');
      globalThis.Notification = MockNotification as unknown as typeof Notification;
    });

    it('requests permission and returns result', async () => {
      MockNotification.requestPermission = vi.fn().mockResolvedValue('granted');

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
      expect(MockNotification.requestPermission).toHaveBeenCalled();
    });

    it('handles denied permission', async () => {
      MockNotification.requestPermission = vi.fn().mockResolvedValue('denied');

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });

    it('falls back to callback API on error', async () => {
      MockNotification.requestPermission = vi.fn().mockImplementation(callback => {
        if (typeof callback === 'function') {
          callback('granted');
        } else {
          throw new Error('Promise API not supported');
        }
      });

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
    });
  });

  describe('sendPriceAlertNotification', () => {
    const baseAlert: PriceAlert = {
      symbol: 'AAPL',
      name: 'Apple Inc',
      changePct: 7.5,
      currentPrice: 185.5,
      direction: 'up',
      assetType: 'stock',
    };

    it('returns null when Notification not supported', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Notification;
      const result = sendPriceAlertNotification(baseAlert);
      expect(result).toBeNull();
      globalThis.Notification = MockNotification as unknown as typeof Notification;
    });

    it('returns null when permission not granted', () => {
      MockNotification.permission = 'denied';
      const result = sendPriceAlertNotification(baseAlert);
      expect(result).toBeNull();
    });

    it('creates notification with correct title for upward movement', () => {
      MockNotification.permission = 'granted';
      sendPriceAlertNotification(baseAlert);

      expect(mockNotificationInstances).toHaveLength(1);
      expect(mockNotificationInstances[0]).toMatchObject({
        title: '📈 AAPL +7.50%',
        options: expect.objectContaining({
          body: 'Apple Inc is now $185.50',
          icon: '/favicon.ico',
          tag: 'orion-price-alert-AAPL',
        }),
      });
    });

    it('creates notification with correct title for downward movement', () => {
      MockNotification.permission = 'granted';
      const downAlert: PriceAlert = {
        ...baseAlert,
        changePct: -5.25,
        direction: 'down',
      };
      sendPriceAlertNotification(downAlert);

      expect(mockNotificationInstances).toHaveLength(1);
      expect(mockNotificationInstances[0].title).toBe('📉 AAPL -5.25%');
    });

    it('auto-closes notification after 10 seconds', () => {
      MockNotification.permission = 'granted';
      sendPriceAlertNotification(baseAlert);

      expect(mockNotificationInstances[0].close).not.toHaveBeenCalled();

      vi.advanceTimersByTime(10_000);

      expect(mockNotificationInstances[0].close).toHaveBeenCalled();
    });

    it('returns the notification instance', () => {
      MockNotification.permission = 'granted';
      const result = sendPriceAlertNotification(baseAlert);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('close');
    });
  });

  describe('detectSignificantPriceChanges', () => {
    const createWatchlistItem = (symbol: string, changePct: number): WatchlistItemWithPrice => ({
      id: `watch-${symbol}`,
      symbol,
      assetType: 'stock',
      currentPrice: 100,
      changePct,
      companyName: `${symbol} Company`,
    });

    it('returns empty array when no items exceed threshold', () => {
      const watchlist = [createWatchlistItem('AAPL', 2), createWatchlistItem('GOOGL', -3)];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result).toHaveLength(0);
    });

    it('returns alerts for items exceeding threshold', () => {
      const watchlist = [
        createWatchlistItem('AAPL', 7),
        createWatchlistItem('GOOGL', -8),
        createWatchlistItem('MSFT', 3),
      ];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result).toHaveLength(2);
      expect(result.map(a => a.symbol)).toEqual(['AAPL', 'GOOGL']);
    });

    it('excludes already notified symbols', () => {
      const watchlist = [createWatchlistItem('AAPL', 10), createWatchlistItem('GOOGL', 10)];
      const notified = new Set(['AAPL']);

      const result = detectSignificantPriceChanges([], watchlist, 5, notified);
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('GOOGL');
    });

    it('correctly identifies direction as up', () => {
      const watchlist = [createWatchlistItem('AAPL', 6)];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result[0].direction).toBe('up');
    });

    it('correctly identifies direction as down', () => {
      const watchlist = [createWatchlistItem('AAPL', -6)];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result[0].direction).toBe('down');
    });

    it('uses absolute value for threshold comparison', () => {
      const watchlist = [createWatchlistItem('AAPL', -7)];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result).toHaveLength(1);
    });

    it('uses symbol as name when companyName is missing', () => {
      const watchlist: WatchlistItemWithPrice[] = [
        {
          id: 'watch-BTC',
          symbol: 'BTC',
          assetType: 'crypto',
          currentPrice: 50000,
          changePct: 10,
          companyName: undefined,
        },
      ];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result[0].name).toBe('BTC');
    });

    it('includes exact threshold matches', () => {
      const watchlist = [createWatchlistItem('AAPL', 5)];

      const result = detectSignificantPriceChanges([], watchlist, 5, new Set());
      expect(result).toHaveLength(1);
    });
  });

  describe('processAndSendPriceAlerts', () => {
    const createWatchlistItem = (symbol: string, changePct: number): WatchlistItemWithPrice => ({
      id: `watch-${symbol}`,
      symbol,
      assetType: 'stock',
      currentPrice: 100,
      changePct,
      companyName: `${symbol} Company`,
    });

    it('returns 0 when Notification not supported', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).Notification;
      const notified = new Set<string>();
      const result = processAndSendPriceAlerts([], [], 5, notified);
      expect(result).toBe(0);
      globalThis.Notification = MockNotification as unknown as typeof Notification;
    });

    it('returns 0 when permission not granted', () => {
      MockNotification.permission = 'denied';
      const notified = new Set<string>();
      const result = processAndSendPriceAlerts([], [], 5, notified);
      expect(result).toBe(0);
    });

    it('sends notifications and returns count', () => {
      MockNotification.permission = 'granted';
      const watchlist = [createWatchlistItem('AAPL', 10), createWatchlistItem('GOOGL', 8)];
      const notified = new Set<string>();

      const result = processAndSendPriceAlerts([], watchlist, 5, notified);
      expect(result).toBe(2);
      expect(notified.has('AAPL')).toBe(true);
      expect(notified.has('GOOGL')).toBe(true);
    });

    it('adds sent symbols to notified set', () => {
      MockNotification.permission = 'granted';
      const watchlist = [createWatchlistItem('AAPL', 10)];
      const notified = new Set<string>();

      processAndSendPriceAlerts([], watchlist, 5, notified);
      expect(notified.has('AAPL')).toBe(true);
    });

    it('does not duplicate notifications for same symbol', () => {
      MockNotification.permission = 'granted';
      const watchlist = [createWatchlistItem('AAPL', 10)];
      const notified = new Set<string>(['AAPL']);

      const result = processAndSendPriceAlerts([], watchlist, 5, notified);
      expect(result).toBe(0);
    });
  });

  describe('clearNotifiedSymbols', () => {
    it('clears all symbols from the set', () => {
      const notified = new Set(['AAPL', 'GOOGL', 'MSFT']);
      clearNotifiedSymbols(notified);
      expect(notified.size).toBe(0);
    });

    it('handles empty set', () => {
      const notified = new Set<string>();
      expect(() => clearNotifiedSymbols(notified)).not.toThrow();
      expect(notified.size).toBe(0);
    });
  });
});
