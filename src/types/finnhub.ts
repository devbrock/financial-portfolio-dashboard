export type FinnhubStockQuote = {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price
  l: number; // Low price
  o: number; // Open price
  pc: number; // Previous close price
};

export type FinnhubCompanyProfile = {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
};

export type FinnhubSymbolSearchResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

export type FinnhubSymbolLookup = {
  count: number;
  result: FinnhubSymbolSearchResult[];
};
