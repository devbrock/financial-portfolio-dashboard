/**
 * Hook for managing browser notifications for price alerts.
 *
 * This hook acts like a notifications control center - it handles requesting
 * permissions, syncing state with Redux, and triggering alerts when prices
 * move significantly.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateNotificationPreferences } from '@/features/portfolio/portfolioSlice';
import {
  getNotificationPermission,
  requestNotificationPermission,
  processAndSendPriceAlerts,
  DEFAULT_NOTIFICATION_THRESHOLD_PCT,
} from '@/services/notifications';
import type { HoldingWithPrice, WatchlistItemWithPrice } from '@/types/portfolio';

/**
 * Return type for useNotifications hook
 */
export type UseNotificationsReturn = {
  /** Whether notifications are enabled by the user */
  enabled: boolean;
  /** Current threshold percentage for triggering alerts */
  thresholdPct: number;
  /** Current browser permission status */
  permissionStatus: NotificationPermission | 'unsupported';
  /** Whether permission has been granted */
  hasPermission: boolean;
  /** Request notification permission (must be called on user action) */
  requestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  /** Toggle notifications on/off */
  toggleNotifications: () => Promise<void>;
  /** Enable notifications (requests permission if needed) */
  enableNotifications: () => Promise<boolean>;
  /** Disable notifications */
  disableNotifications: () => void;
  /** Update the threshold percentage */
  setThreshold: (pct: number) => void;
  /** Check for significant price changes and send notifications */
  checkPriceAlerts: (holdings: HoldingWithPrice[], watchlist: WatchlistItemWithPrice[]) => number;
  /** Clear the list of already-notified symbols (resets for new day) */
  resetNotifiedSymbols: () => void;
};

/**
 * Hook for managing browser notifications for significant price changes.
 *
 * @example
 * ```tsx
 * const { enabled, toggleNotifications, checkPriceAlerts } = useNotifications();
 *
 * // Toggle notifications on user button click
 * <button onClick={toggleNotifications}>
 *   {enabled ? 'Disable' : 'Enable'} Notifications
 * </button>
 *
 * // Check for alerts when portfolio data updates
 * useEffect(() => {
 *   if (enabled) {
 *     checkPriceAlerts(holdingsWithPrice, watchlistWithPrice);
 *   }
 * }, [holdingsWithPrice, watchlistWithPrice, enabled, checkPriceAlerts]);
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const dispatch = useAppDispatch();

  // Get notification preferences from Redux
  const notificationPrefs = useAppSelector(state => state.portfolio.preferences.notifications);

  // Handle undefined preferences for backwards compatibility with existing stored state
  const enabled = notificationPrefs?.enabled ?? false;
  const thresholdPct = notificationPrefs?.thresholdPct ?? DEFAULT_NOTIFICATION_THRESHOLD_PCT;
  const storedPermissionStatus = notificationPrefs?.permissionStatus ?? 'default';

  // Track notified symbols to avoid duplicate notifications
  // Using a ref so it persists across renders but doesn't trigger re-renders
  const notifiedSymbolsRef = useRef<Set<string>>(new Set());

  // Sync permission status with browser on mount
  useEffect(() => {
    const currentPermission = getNotificationPermission();
    if (currentPermission !== storedPermissionStatus) {
      dispatch(updateNotificationPreferences({ permissionStatus: currentPermission }));
    }
  }, [dispatch, storedPermissionStatus]);

  const hasPermission = storedPermissionStatus === 'granted';

  /**
   * Request notification permission from the browser.
   * MUST be called in response to a user action (e.g., button click).
   */
  const requestPermission = useCallback(async (): Promise<
    NotificationPermission | 'unsupported'
  > => {
    const permission = await requestNotificationPermission();
    dispatch(updateNotificationPreferences({ permissionStatus: permission }));
    return permission;
  }, [dispatch]);

  /**
   * Enable notifications, requesting permission if needed.
   * Returns true if notifications were successfully enabled.
   */
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    let permission = getNotificationPermission();

    // If permission not granted, request it
    if (permission !== 'granted' && permission !== 'unsupported') {
      permission = await requestPermission();
    }

    if (permission === 'granted') {
      dispatch(updateNotificationPreferences({ enabled: true }));
      return true;
    }

    return false;
  }, [dispatch, requestPermission]);

  /**
   * Disable notifications.
   */
  const disableNotifications = useCallback((): void => {
    dispatch(updateNotificationPreferences({ enabled: false }));
  }, [dispatch]);

  /**
   * Toggle notifications on/off.
   * If enabling, will request permission if needed.
   */
  const toggleNotifications = useCallback(async (): Promise<void> => {
    if (enabled) {
      disableNotifications();
    } else {
      await enableNotifications();
    }
  }, [enabled, disableNotifications, enableNotifications]);

  /**
   * Update the threshold percentage for triggering alerts.
   */
  const setThreshold = useCallback(
    (pct: number): void => {
      const clampedPct = Math.max(0.1, Math.min(100, pct));
      dispatch(updateNotificationPreferences({ thresholdPct: clampedPct }));
    },
    [dispatch]
  );

  /**
   * Check for significant price changes and send notifications.
   * Returns the number of notifications sent.
   */
  const checkPriceAlerts = useCallback(
    (holdings: HoldingWithPrice[], watchlist: WatchlistItemWithPrice[]): number => {
      if (!enabled || !hasPermission) {
        return 0;
      }

      return processAndSendPriceAlerts(
        holdings,
        watchlist,
        thresholdPct,
        notifiedSymbolsRef.current
      );
    },
    [enabled, hasPermission, thresholdPct]
  );

  /**
   * Reset the list of notified symbols.
   * Useful when the trading day resets.
   */
  const resetNotifiedSymbols = useCallback((): void => {
    notifiedSymbolsRef.current.clear();
  }, []);

  return {
    enabled,
    thresholdPct,
    permissionStatus: storedPermissionStatus,
    hasPermission,
    requestPermission,
    toggleNotifications,
    enableNotifications,
    disableNotifications,
    setThreshold,
    checkPriceAlerts,
    resetNotifiedSymbols,
  };
}
