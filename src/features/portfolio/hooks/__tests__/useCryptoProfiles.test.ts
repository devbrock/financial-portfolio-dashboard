import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCryptoProfiles } from "../useCryptoProfiles";
import { createTestStore, createTestQueryClient, createTestWrapper } from "@/test/test-utils";


describe("useCryptoProfiles", () => {
  it("returns profile map for coin ids", async () => {
    const store = createTestStore();
    const queryClient = createTestQueryClient();
    const wrapper = createTestWrapper(store, queryClient);

    const { result } = renderHook(() => useCryptoProfiles(["bitcoin"]), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profileMap.get("bitcoin")?.name).toBe("Bitcoin");
  });
});
