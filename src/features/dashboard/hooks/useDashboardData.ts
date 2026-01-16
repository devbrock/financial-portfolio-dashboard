import { useMemo } from "react";
import type {
  AssetCardModel,
  PerformancePoint,
  AllocationSlice,
  HoldingRow,
} from "@types/dashboard";

export function useDashboardData() {
  const assets: readonly AssetCardModel[] = useMemo(
    () => [
      {
        id: "goog",
        name: "Google",
        ticker: "GOOG",
        valueUsd: 67859,
        weeklyDeltaPct: 8.2,
      },
      {
        id: "aapl",
        name: "Applagin",
        ticker: "AAPL",
        valueUsd: 85950,
        weeklyDeltaPct: -3.6,
      },
      {
        id: "spot",
        name: "Spotify",
        ticker: "SPOT",
        valueUsd: 48785,
        weeklyDeltaPct: 4.8,
      },
      {
        id: "dbx",
        name: "Dropbox",
        ticker: "DBX",
        valueUsd: 56749,
        weeklyDeltaPct: 8.9,
      },
    ],
    []
  );

  const perfDaily: readonly PerformancePoint[] = useMemo(
    () => [
      { month: "6am", profitUsd: 120 },
      { month: "9am", profitUsd: 280 },
      { month: "12pm", profitUsd: 450 },
      { month: "3pm", profitUsd: 520 },
      { month: "6pm", profitUsd: 680 },
    ],
    []
  );

  const perfWeekly: readonly PerformancePoint[] = useMemo(
    () => [
      { month: "Mon", profitUsd: 1200 },
      { month: "Tue", profitUsd: 2100 },
      { month: "Wed", profitUsd: 1800 },
      { month: "Thu", profitUsd: 2800 },
      { month: "Fri", profitUsd: 3200 },
      { month: "Sat", profitUsd: 2900 },
      { month: "Sun", profitUsd: 3400 },
    ],
    []
  );

  const perfMonthly: readonly PerformancePoint[] = useMemo(
    () => [
      { month: "Jan", profitUsd: 4000 },
      { month: "Feb", profitUsd: 8200 },
      { month: "Mar", profitUsd: 7500 },
      { month: "Apr", profitUsd: 12200 },
      { month: "May", profitUsd: 15100 },
      { month: "Jun", profitUsd: 18800 },
      { month: "Jul", profitUsd: 21000 },
      { month: "Aug", profitUsd: 34500 },
      { month: "Sep", profitUsd: 38500 },
    ],
    []
  );

  const allocation: readonly AllocationSlice[] = useMemo(
    () => [
      { name: "ETFs", value: 48, color: "var(--ui-inverse-bg)" },
      { name: "Stocks", value: 28, color: "var(--ui-primary)" },
      { name: "Bonds", value: 20, color: "var(--ui-accent)" },
      {
        name: "Crypto",
        value: 16,
        color: "color-mix(in oklab, var(--ui-accent) 45%, white 55%)",
      },
    ],
    []
  );

  const holdings: readonly HoldingRow[] = useMemo(
    () => [
      {
        id: "h1",
        name: "Applagin",
        ticker: "AAPL",
        date: "22 June 2024",
        volume: 8.2e9,
        changePct: 4.1,
        priceUsd: 87580,
        pnlUsd: 24.05,
        status: "active",
      },
      {
        id: "h2",
        name: "Spotify",
        ticker: "SPOT",
        date: "24 June 2024",
        volume: 9.16e9,
        changePct: -3.6,
        priceUsd: 98478,
        pnlUsd: -32.05,
        status: "pending",
      },
      {
        id: "h3",
        name: "Dropbox",
        ticker: "DBX",
        date: "26 June 2024",
        volume: 3.06e9,
        changePct: 2.2,
        priceUsd: 56749,
        pnlUsd: 18.7,
        status: "active",
      },
    ],
    []
  );

  return {
    assets,
    perfDaily,
    perfWeekly,
    perfMonthly,
    allocation,
    holdings,
  };
}
