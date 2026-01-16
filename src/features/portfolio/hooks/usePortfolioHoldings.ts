import { useAppSelector } from "@/store/hooks";

/**
 * Get portfolio holdings from Redux store
 */
export function usePortfolioHoldings() {
  return useAppSelector((state) => state.portfolio.holdings);
}
