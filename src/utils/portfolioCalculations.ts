import type {
  Holding,
  HoldingWithPrice,
  PortfolioMetrics,
} from "@/types/portfolio";

/**
 * Calculate profit/loss for a single holding
 */
export function calculatePL(
  holding: Holding,
  currentPrice: number
): { plUsd: number; plPct: number } {
  const costBasis = holding.quantity * holding.purchasePrice;
  const currentValue = holding.quantity * currentPrice;
  const plUsd = currentValue - costBasis;
  const plPct = costBasis > 0 ? (plUsd / costBasis) * 100 : 0;

  return { plUsd, plPct };
}

/**
 * Enrich holding with current price and P/L data
 */
export function enrichHoldingWithPrice(
  holding: Holding,
  currentPrice: number,
  companyName?: string,
  logo?: string
): HoldingWithPrice {
  const { plUsd, plPct } = calculatePL(holding, currentPrice);
  const currentValue = holding.quantity * currentPrice;

  return {
    ...holding,
    currentPrice,
    currentValue,
    plUsd,
    plPct,
    companyName,
    logo,
  };
}

/**
 * Calculate total portfolio value
 */
export function calculateTotalValue(holdings: HoldingWithPrice[]): number {
  return holdings.reduce((total, holding) => {
    return total + holding.currentValue;
  }, 0);
}

/**
 * Calculate total cost basis
 */
export function calculateTotalCostBasis(holdings: Holding[]): number {
  return holdings.reduce((total, holding) => {
    return total + holding.quantity * holding.purchasePrice;
  }, 0);
}

/**
 * Calculate asset allocation (stocks vs crypto)
 */
export function calculateAssetAllocation(
  holdings: HoldingWithPrice[]
): { stockValue: number; cryptoValue: number; stockPct: number; cryptoPct: number } {
  let stockValue = 0;
  let cryptoValue = 0;

  holdings.forEach((holding) => {
    if (holding.assetType === "stock") {
      stockValue += holding.currentValue;
    } else {
      cryptoValue += holding.currentValue;
    }
  });

  const total = stockValue + cryptoValue;

  return {
    stockValue,
    cryptoValue,
    stockPct: total > 0 ? (stockValue / total) * 100 : 0,
    cryptoPct: total > 0 ? (cryptoValue / total) * 100 : 0,
  };
}

/**
 * Calculate all portfolio metrics
 */
export function calculatePortfolioMetrics(
  holdings: Holding[],
  holdingsWithPrice: HoldingWithPrice[]
): PortfolioMetrics {
  const totalValue = calculateTotalValue(holdingsWithPrice);
  const totalCostBasis = calculateTotalCostBasis(holdings);
  const totalPL = totalValue - totalCostBasis;
  const totalPLPct = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0;

  const { stockValue, cryptoValue, stockPct, cryptoPct } =
    calculateAssetAllocation(holdingsWithPrice);

  return {
    totalValue,
    totalCostBasis,
    totalPL,
    totalPLPct,
    stockValue,
    cryptoValue,
    stockPct,
    cryptoPct,
  };
}
