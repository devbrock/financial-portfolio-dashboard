import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PerformanceChart } from "../PerformanceChart";
import { renderWithProviders } from "@/test/test-utils";
import type { PerformancePoint } from "@/types/dashboard";

const data: PerformancePoint[] = [
  { month: "Jan", profitUsd: 100 },
  { month: "Feb", profitUsd: 120 },
];

describe("PerformanceChart", () => {
  it("changes range when clicking chips", async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();

    renderWithProviders(
      <PerformanceChart data={data} range="7d" onRangeChange={onRangeChange} />
    );

    await user.click(screen.getByRole("button", { name: "90D" }));
    expect(onRangeChange).toHaveBeenCalledWith("90d");
  });
});
