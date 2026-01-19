export type AlphaVantageMetaData = {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
};

export type AlphaVantageDailyData = {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
};

export type AlphaVantageTimeSeriesDaily = {
  'Meta Data': AlphaVantageMetaData;
  'Time Series (Daily)': Record<string, AlphaVantageDailyData>;
};
