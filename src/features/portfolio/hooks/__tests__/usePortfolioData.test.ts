import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePortfolioData } from "../usePortfolioData";
import {
  createTestStore,
  createTestQueryClient,
  createTestWrapper,
} from "@/test/test-utils";
import type { PortfolioState } from "@/types/portfolio";


describe("usePortfolioData", () => {
  it("combines holdings with live data", async () => {
    const preloadedState: { portfolio: PortfolioState } = {
      portfolio: {
        holdings: [
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
            quantity: 0.5,
            purchasePrice: 20000,
            purchaseDate: "2024-01-02",
          },
        ],
        watchlist: [],
        preferences: {
          theme: "light",
          currency: "USD",
          chartRange: "30d",
          sortPreference: { key: "name", direction: "asc" },
        },
        userSeed: {
          seed: "seed",
          initialized: true,
        },
      },
    };
    const store = createTestStore(preloadedState);
    const queryClient = createTestQueryClient();
    const wrapper = createTestWrapper(store, queryClient);

    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.holdingsWithPrice).toHaveLength(2);
    const stock = result.current.holdingsWithPrice.find(
      (h) => h.symbol === "AAPL"
    );
    const crypto = result.current.holdingsWithPrice.find(
      (h) => h.symbol === "bitcoin"
    );
    expect(stock?.companyName).toBe("Apple");
    expect(crypto?.logo).toContain("coingecko");
  });
});
