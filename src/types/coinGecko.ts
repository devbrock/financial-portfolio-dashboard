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

export type CoinGeckoCoin = {
  id: string;
  symbol: string;
  name: string;
  image?: {
    thumb?: string;
    small?: string;
    large?: string;
  };
};

export type CoinGeckoSearchCoin = {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  large?: string;
  market_cap_rank?: number;
};

export type CoinGeckoSearchResponse = {
  coins: CoinGeckoSearchCoin[];
};
