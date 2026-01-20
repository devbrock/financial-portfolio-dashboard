export type ExchangeRateResponse = {
  base: string;
  date: string;
  rates: Record<string, number>;
};
