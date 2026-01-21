import type {
  CoinGeckoSimplePrice,
  CoinGeckoMarketChart,
  CoinGeckoMarketCoin,
  CoinGeckoCoin,
  CoinGeckoSearchResponse,
} from '@/types/coinGecko';
import { coinGeckoClient } from '@/services/api/clients/coinGeckoClient';

export type SimplePriceParams = {
  ids: string; // Comma-separated coin IDs (e.g., "bitcoin,ethereum")
  vs_currencies: string; // Comma-separated currencies (e.g., "usd,eur")
  include_market_cap?: boolean;
  include_24hr_vol?: boolean;
  include_24hr_change?: boolean;
  include_last_updated_at?: boolean;
};

export type MarketChartParams = {
  vs_currency: string; // Target currency (e.g., "usd")
  days: string; // Number of days (1, 7, 14, 30, 90, 180, 365, max)
};

export type CoinMarketsParams = {
  vs_currency: string; // Target currency (e.g., "usd")
  ids?: string; // Comma-separated coin IDs
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string; // e.g., "24h"
};

export type CoinDetailsParams = {
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
};

/* Type-safe API functions */
export const coinGeckoApi = {
  getSimplePrice: async (params: SimplePriceParams) => {
    return coinGeckoClient.get<CoinGeckoSimplePrice>('/simple/price', {
      params,
    });
  },

  getMarketChart: async (coinId: string, params: MarketChartParams) => {
    return coinGeckoClient.get<CoinGeckoMarketChart>(`/coins/${coinId}/market_chart`, {
      params,
    });
  },

  getMarkets: async (params: CoinMarketsParams) => {
    return coinGeckoClient.get<CoinGeckoMarketCoin[]>('/coins/markets', {
      params,
    });
  },

  getCoin: async (coinId: string, params: CoinDetailsParams) => {
    return coinGeckoClient.get<CoinGeckoCoin>(`/coins/${coinId}`, {
      params,
    });
  },

  searchCoins: async (query: string) => {
    return coinGeckoClient.get<CoinGeckoSearchResponse>('/search', {
      params: { query },
    });
  },
};
