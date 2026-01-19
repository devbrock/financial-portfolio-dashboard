import type {
  FinnhubStockQuote,
  FinnhubCompanyProfile,
  FinnhubSymbolLookup,
  FinnhubEarningsCalendar,
  FinnhubNewsItem,
} from '@/types/finnhub';
import { finnhubClient } from '@/services/api/clients/finnhubClient';

/* Type-safe API functions */
export const finnhubApi = {
  getStockQuote: async (symbol: string) => {
    return finnhubClient.get<FinnhubStockQuote>('/quote', {
      params: { symbol },
    });
  },

  getCompanyProfile: async (symbol: string) => {
    return finnhubClient.get<FinnhubCompanyProfile>('/stock/profile2', {
      params: { symbol },
    });
  },

  searchSymbol: async (query: string, exchange?: string) => {
    return finnhubClient.get<FinnhubSymbolLookup>('/search', {
      params: { q: query, ...(exchange && { exchange }) },
    });
  },

  getEarningsCalendar: async (from: string, to: string) => {
    return finnhubClient.get<FinnhubEarningsCalendar>('/calendar/earnings', {
      params: { from, to },
    });
  },

  getMarketNews: async (category: string) => {
    return finnhubClient.get<FinnhubNewsItem[]>('/news', {
      params: { category },
    });
  },

  getCompanyNews: async (symbol: string, from: string, to: string) => {
    return finnhubClient.get<FinnhubNewsItem[]>('/company-news', {
      params: { symbol, from, to },
    });
  },
};
