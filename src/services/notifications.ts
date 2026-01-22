/**
 * Browser notifications service for price alerts.
 *
 * Think of this service like a watchdog for your portfolio - it monitors price
 * changes and barks (notifies) when something significant happens.
 */

import type { HoldingWithPrice, WatchlistItemWithPrice } from '@/types/portfolio';

/**
 * Default threshold percentage for price change notifications.
 * Assets moving more than this percentage will trigger alerts.
 */
export const DEFAULT_NOTIFICATION_THRESHOLD_PCT = 5;

/**
 * Icon path for notifications
 */
const NOTIFICATION_ICON = '/favicon.ico';

/**
 * Notification tag prefixes to allow grouping/replacement
 */
const NOTIFICATION_TAG_PREFIX = 'orion-price-alert';

/**
 * Data structure for a price alert
 */
export type PriceAlert = {
  symbol: string;
  name: string;
  changePct: number;
  currentPrice: number;
  direction: 'up' | 'down';
  assetType: 'stock' | 'crypto';
};

/**
 * Check if the browser supports notifications
 * @returns true if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 * @returns The current permission status or 'unsupported' if not available
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 * This MUST be called in response to a user action (e.g., button click).
 *
 * @returns Promise resolving to the permission status
 */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    // Fallback for older browsers with callback-based API
    return new Promise(resolve => {
      Notification.requestPermission(permission => {
        resolve(permission);
      });
    });
  }
}

/**
 * Send a browser notification for a price alert
 *
 * @param alert - The price alert data
 * @returns The Notification instance or null if not permitted/supported
 */
export function sendPriceAlertNotification(alert: PriceAlert): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const directionEmoji = alert.direction === 'up' ? '📈' : '📉';
  const sign = alert.direction === 'up' ? '+' : '';
  const formattedPct = `${sign}${alert.changePct.toFixed(2)}%`;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(alert.currentPrice);

  const title = `${directionEmoji} ${alert.symbol.toUpperCase()} ${formattedPct}`;
  const body = `${alert.name} is now ${formattedPrice}`;

  const notification = new Notification(title, {
    body,
    icon: NOTIFICATION_ICON,
    tag: `${NOTIFICATION_TAG_PREFIX}-${alert.symbol}`,
    requireInteraction: false,
    silent: false,
  });

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10_000);

  return notification;
}

/**
 * Find assets with significant price changes that warrant notifications.
 * Like panning for gold - we sift through all the price data to find the nuggets
 * (significant movers).
 *
 * @param holdings - Holdings with current price data
 * @param watchlist - Watchlist items with current price data
 * @param thresholdPct - The minimum percentage change to trigger an alert
 * @param previouslyNotified - Set of symbols that have already been notified
 * @returns Array of price alerts for assets exceeding the threshold
 */
export function detectSignificantPriceChanges(
  _holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[],
  thresholdPct: number,
  previouslyNotified: Set<string>
): PriceAlert[] {
  const alerts: PriceAlert[] = [];

  // Check holdings - we use plPct as the change indicator
  // Note: plPct is based on purchase price, not daily change
  // For proper daily change detection, we'd need 24h change data from the API
  // Holdings don't have 24h change, so we skip them for daily notifications

  // Check watchlist items - these have changePct (24h change)
  for (const item of watchlist) {
    const absChange = Math.abs(item.changePct);

    if (absChange >= thresholdPct && !previouslyNotified.has(item.symbol)) {
      alerts.push({
        symbol: item.symbol,
        name: item.companyName || item.symbol,
        changePct: item.changePct,
        currentPrice: item.currentPrice,
        direction: item.changePct >= 0 ? 'up' : 'down',
        assetType: item.assetType,
      });
    }
  }

  return alerts;
}

/**
 * Process and send notifications for all detected significant price changes.
 *
 * @param holdings - Holdings with current price data
 * @param watchlist - Watchlist items with current price data
 * @param thresholdPct - The minimum percentage change to trigger an alert
 * @param notifiedSymbols - Set of symbols already notified (will be mutated)
 * @returns Number of notifications sent
 */
export function processAndSendPriceAlerts(
  holdings: HoldingWithPrice[],
  watchlist: WatchlistItemWithPrice[],
  thresholdPct: number,
  notifiedSymbols: Set<string>
): number {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return 0;
  }

  const alerts = detectSignificantPriceChanges(holdings, watchlist, thresholdPct, notifiedSymbols);

  let sentCount = 0;

  for (const alert of alerts) {
    const notification = sendPriceAlertNotification(alert);
    if (notification) {
      notifiedSymbols.add(alert.symbol);
      sentCount++;
    }
  }

  return sentCount;
}

/**
 * Clear the notified symbols set. Called when the day changes or user resets.
 *
 * @param notifiedSymbols - The set to clear
 */
export function clearNotifiedSymbols(notifiedSymbols: Set<string>): void {
  notifiedSymbols.clear();
}
