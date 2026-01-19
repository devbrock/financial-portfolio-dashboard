export type AssetCardModel = {
  id: string;
  name: string;
  ticker: string;
  valueUsd: number;
  weeklyDeltaPct: number;
  logo?: string;
};

export type WatchlistCardModel = {
  id: string;
  name: string;
  ticker: string;
  priceUsd: number;
  changePct: number;
  logo?: string;
};

export type PerformancePoint = {
  date: string;
  value: number;
};

export type AllocationSlice = {
  name: "ETFs" | "Stocks" | "Bonds" | "Crypto";
  value: number;
  color: string;
};

export type HoldingStatus = "active" | "pending";

export type HoldingRow = {
  id: string;
  name: string;
  ticker: string;
  date: string;
  volume: number;
  changePct: number;
  purchasePrice: number;
  priceUsd: number;
  pnlUsd: number;
  status: HoldingStatus;
  logo?: string;
};

export type SortKey =
  | "name"
  | "date"
  | "volume"
  | "changePct"
  | "purchasePrice"
  | "priceUsd"
  | "pnlUsd"
  | "status";

export type SortDir = "asc" | "desc";
