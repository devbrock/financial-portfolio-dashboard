import { describe, expect, it } from "vitest";
import {
  calculatePL,
  calculateTotalValue,
  calculateTotalCostBasis,
  calculateAssetAllocation,
  calculatePortfolioMetrics,
} from "../portfolioCalculations";
import type { Holding, HoldingWithPrice } from "@/types/portfolio";

const holdings: Holding[] = [
  {
    id: "1",
    symbol: "AAPL",
    assetType: "stock",
    quantity: 2,
    purchasePrice: 100,
    purchaseDate: "2024-01-01",
  },
  {
    id: "2",
    symbol: "bitcoin",
    assetType: "crypto",
    quantity: 1,
    purchasePrice: 20000,
    purchaseDate: "2024-01-01",
  },
];

const holdingsWithPrice: HoldingWithPrice[] = [
  {
    ...holdings[0],
    currentPrice: 120,
    currentValue: 240,
    plUsd: 40,
    plPct: 20,
    companyName: "Apple",
    logo: "https://logo",
  },
  {
    ...holdings[1],
    currentPrice: 25000,
    currentValue: 25000,
    plUsd: 5000,
    plPct: 25,
  },
];

describe("portfolio calculations", () => {
  it("calculates profit/loss", () => {
    const result = calculatePL(holdings[0], 120);
    expect(result.plUsd).toBe(40);
    expect(result.plPct).toBe(20);
  });

  it("calculates total value", () => {
    expect(calculateTotalValue(holdingsWithPrice)).toBe(25240);
  });

  it("calculates total cost basis", () => {
    expect(calculateTotalCostBasis(holdings)).toBe(20200);
  });

  it("calculates asset allocation", () => {
    const allocation = calculateAssetAllocation(holdingsWithPrice);
    expect(allocation.stockValue).toBe(240);
    expect(allocation.cryptoValue).toBe(25000);
  });

  it("calculates portfolio metrics", () => {
    const metrics = calculatePortfolioMetrics(holdings, holdingsWithPrice);
    expect(metrics.totalValue).toBe(25240);
    expect(metrics.totalCostBasis).toBe(20200);
  });
});
