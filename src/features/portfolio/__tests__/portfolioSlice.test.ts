import { describe, expect, it, vi, beforeEach } from "vitest";
import reducer, {
  addHolding,
  initializePortfolio,
  removeHolding,
  resetPortfolio,
  updateHolding,
  updatePreferences,
} from "../portfolioSlice";
import type { Holding, PortfolioState } from "@/types/portfolio";

vi.mock("@/utils/generateSeed", () => ({
  generateSeed: () => "seed-123",
}));

const mockHoldings: Holding[] = [
  {
    id: "h1",
    symbol: "AAPL",
    assetType: "stock",
    quantity: 10,
    purchasePrice: 120,
    purchaseDate: "2024-01-01",
  },
];

vi.mock("@/utils/generateMockHoldings", () => ({
  generateMockHoldings: () => mockHoldings,
}));

const baseState = reducer(undefined, { type: "init" });

describe("portfolioSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with mock holdings once", () => {
    const next = reducer(baseState, initializePortfolio());
    expect(next.userSeed.initialized).toBe(true);
    expect(next.holdings).toHaveLength(1);

    const again = reducer(next, initializePortfolio());
    expect(again.holdings).toHaveLength(1);
  });

  it("adds a holding", () => {
    const holding: Holding = {
      id: "h2",
      symbol: "MSFT",
      assetType: "stock",
      quantity: 5,
      purchasePrice: 250,
      purchaseDate: "2024-02-01",
    };
    const next = reducer(baseState, addHolding(holding));
    expect(next.holdings).toContainEqual(holding);
  });

  it("removes a holding", () => {
    const state: PortfolioState = {
      ...baseState,
      holdings: mockHoldings,
    };
    const next = reducer(state, removeHolding("h1"));
    expect(next.holdings).toHaveLength(0);
  });

  it("updates a holding when id matches", () => {
    const state: PortfolioState = {
      ...baseState,
      holdings: mockHoldings,
    };
    const next = reducer(
      state,
      updateHolding({ id: "h1", updates: { quantity: 42 } })
    );
    expect(next.holdings[0].quantity).toBe(42);
  });

  it("ignores updates when holding id is missing", () => {
    const state: PortfolioState = {
      ...baseState,
      holdings: mockHoldings,
    };
    const next = reducer(
      state,
      updateHolding({ id: "missing", updates: { quantity: 42 } })
    );
    expect(next.holdings[0].quantity).toBe(10);
  });

  it("updates user preferences", () => {
    const next = reducer(
      baseState,
      updatePreferences({ theme: "dark", currency: "USD" })
    );
    expect(next.preferences.theme).toBe("dark");
  });

  it("resets portfolio", () => {
    const state: PortfolioState = {
      ...baseState,
      holdings: mockHoldings,
      userSeed: { seed: "seed", initialized: true },
    };
    const next = reducer(state, resetPortfolio());
    expect(next.holdings).toHaveLength(0);
    expect(next.userSeed.initialized).toBe(false);
  });
});
