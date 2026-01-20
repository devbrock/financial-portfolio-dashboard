import { queryOptions } from '@tanstack/react-query';
import { exchangeRateClient } from '@/services/api/exchangeRateClient';
import type { ExchangeRateResponse } from '@/types/exchangeRates';

export type GetExchangeRateQueryKey = readonly ['exchangeRates', 'USD'];

const getExchangeRates = async () => {
  const { data } = await exchangeRateClient.get<ExchangeRateResponse>('/USD');
  return data;
};

export const GetExchangeRateQueryOptions = () =>
  queryOptions({
    queryKey: ['exchangeRates', 'USD'] as GetExchangeRateQueryKey,
    queryFn: getExchangeRates,
    staleTime: 55 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });
