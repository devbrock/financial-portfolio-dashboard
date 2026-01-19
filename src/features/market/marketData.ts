export const INDEX_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
] as const;

export const SECTOR_SYMBOLS = [
  { symbol: 'XLK', name: 'Technology' },
  { symbol: 'XLF', name: 'Financials' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLV', name: 'Health Care' },
  { symbol: 'XLY', name: 'Consumer Discretionary' },
  { symbol: 'XLP', name: 'Consumer Staples' },
  { symbol: 'XLI', name: 'Industrials' },
  { symbol: 'XLU', name: 'Utilities' },
  { symbol: 'XLB', name: 'Materials' },
  { symbol: 'XLRE', name: 'Real Estate' },
] as const;
