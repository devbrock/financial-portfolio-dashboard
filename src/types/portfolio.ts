export type AssetType = "stock" | "crypto";

export type Holding = {
  id: string;
  symbol: string; // "AAPL" for stocks, "bitcoin" for crypto
  assetType: AssetType;
  quantity: number;
  purchasePrice: number; // USD per unit
  purchaseDate: string; // ISO date string
  notes?: string;
};

export type UserPreferences = {
  theme: "light" | "dark";
  currency: "USD";
  chartRange: "7d" | "30d" | "90d" | "1y";
  sortPreference: {
    key: string;
    direction: "asc" | "desc";
  };
};

export type UserSeed = {
  seed: string;
  initialized: boolean;
};

export type PortfolioState = {
  holdings: Holding[];
  preferences: UserPreferences;
  userSeed: UserSeed;
};

export type HoldingWithPrice = Holding & {
  currentPrice: number;
  currentValue: number; // quantity * currentPrice
  plUsd: number; // Profit/Loss in USD
  plPct: number; // Profit/Loss percentage
  companyName?: string; // For stocks
  logo?: string; // For stocks
};

export type PortfolioMetrics = {
  totalValue: number;
  totalCostBasis: number;
  totalPL: number;
  totalPLPct: number;
  stockValue: number;
  cryptoValue: number;
  stockPct: number;
  cryptoPct: number;
};
