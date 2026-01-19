import type { Holding, WatchlistItem } from '@/types/portfolio';

export async function addHoldingToPortfolio(holding: Holding): Promise<Holding> {
  return holding;
}

export async function removeHoldingFromPortfolio(holdingId: string): Promise<string> {
  return holdingId;
}

export async function addWatchlistItemToPortfolio(
  item: WatchlistItem
): Promise<WatchlistItem> {
  return item;
}

export async function removeWatchlistItemFromPortfolio(itemId: string): Promise<string> {
  return itemId;
}
