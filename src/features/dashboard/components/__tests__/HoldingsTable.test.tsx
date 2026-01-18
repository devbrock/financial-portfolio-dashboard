import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoldingsTable } from "../HoldingsTable";
import { renderWithProviders } from "@/test/test-utils";
import type { HoldingRow, SortDir, SortKey } from "@/types/dashboard";

const holdings: HoldingRow[] = [
  {
    id: "1",
    name: "Apple",
    ticker: "AAPL",
    date: "January 1, 2024",
    volume: 10,
    changePct: 1.2,
    priceUsd: 190,
    pnlUsd: 100,
    status: "active",
  },
];

describe("HoldingsTable", () => {
  it("calls onSort when clicking headers", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    renderWithProviders(
      <HoldingsTable
        holdings={holdings}
        onSort={onSort}
        sortKey={"name" as SortKey}
        sortDir={"asc" as SortDir}
        onRemove={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "Profit/Loss" }));
    expect(onSort).toHaveBeenCalledWith("pnlUsd");
  });

  it("renders logo fallbacks and value formatting variants", () => {
    const mixedHoldings: HoldingRow[] = [
      {
        id: "1",
        name: "Alpha",
        ticker: "ALP",
        date: "January 1, 2024",
        volume: 10,
        changePct: 2.5,
        priceUsd: 100,
        pnlUsd: 120,
        status: "active",
        logo: "https://example.com/logo.png",
      },
      {
        id: "2",
        name: "Beta",
        ticker: "BET",
        date: "January 2, 2024",
        volume: 5,
        changePct: -1.5,
        priceUsd: 80,
        pnlUsd: -50,
        status: "active",
      },
      {
        id: "3",
        name: "Gamma",
        ticker: "GAM",
        date: "January 3, 2024",
        volume: 7,
        changePct: 0,
        priceUsd: 90,
        pnlUsd: 0,
        status: "active",
      },
    ];

    const { container } = renderWithProviders(
      <HoldingsTable
        holdings={mixedHoldings}
        onSort={() => undefined}
        sortKey={"name" as SortKey}
        sortDir={"asc" as SortDir}
        onRemove={() => undefined}
      />
    );

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("+2.5%")).toBeInTheDocument();
    expect(screen.getByText("-1.5%")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
    expect(screen.getByText("+$120.00")).toBeInTheDocument();
    expect(screen.getByText("-$50.00")).toBeInTheDocument();
    expect(screen.getByText("+$0.00")).toBeInTheDocument();
  });
});
