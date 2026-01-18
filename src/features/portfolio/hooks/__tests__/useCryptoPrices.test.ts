import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCryptoPrices } from "../useCryptoPrices";
import { createTestStore, createTestQueryClient, createTestWrapper } from "@/test/test-utils";


describe("useCryptoPrices", () => {
  it("returns price map for coin ids", async () => {
    const store = createTestStore();
    const queryClient = createTestQueryClient();
    const wrapper = createTestWrapper(store, queryClient);

    const { result } = renderHook(() => useCryptoPrices(["bitcoin"]), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.priceMap.get("bitcoin")).toBe(50000);
  });
});
