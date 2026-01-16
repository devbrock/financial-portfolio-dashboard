export type CoinGeckoCoinPrice = {
  usd: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
};

export type CoinGeckoSimplePrice = Record<string, CoinGeckoCoinPrice>;

export type CoinGeckoMarketChart = {
  prices: Array<[number, number]>;
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
};
