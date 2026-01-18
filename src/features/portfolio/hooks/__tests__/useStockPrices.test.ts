import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStockPrices } from "../useStockPrices";
import { createTestStore, createTestQueryClient, createTestWrapper } from "@/test/test-utils";


describe("useStockPrices", () => {
  it("returns quote map for symbols", async () => {
    const store = createTestStore();
    const queryClient = createTestQueryClient();
    const wrapper = createTestWrapper(store, queryClient);

    const { result } = renderHook(() => useStockPrices(["AAPL"]), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.quoteMap.get("AAPL")?.c).toBe(190);
  });
});
