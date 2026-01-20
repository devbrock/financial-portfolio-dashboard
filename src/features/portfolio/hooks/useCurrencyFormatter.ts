import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetExchangeRateQueryOptions } from '@/queryOptions/GetExchangeRateQueryOptions';
import { useAppSelector } from '@/store/hooks';

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1,
  GBP: 1,
  JPY: 1,
};

export function useCurrencyFormatter() {
  const currency = useAppSelector(state => state.portfolio.preferences.currency);
  const { data, isLoading, isError } = useQuery(GetExchangeRateQueryOptions());

  const rate = useMemo(() => {
    const rates = data?.rates ?? FALLBACK_RATES;
    return rates[currency] ?? 1;
  }, [currency, data?.rates]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }),
    [currency]
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        compactDisplay: 'short',
      }),
    [currency]
  );

  const formatMoney = (value: number) => formatter.format(value * rate);
  const formatCompactMoney = (value: number) => compactFormatter.format(value * rate);

  return {
    currency,
    rate,
    formatMoney,
    formatCompactMoney,
    isLoading,
    isError,
  };
}
