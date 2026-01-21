import { queryOptions } from '@tanstack/react-query';
import { exchangeRateClient } from '@/services/api/exchangeRateClient';
import type { ExchangeRateResponse } from '@/types/exchangeRates';
import { QUERY_TIMINGS } from './queryTimings';

export type GetExchangeRateQueryKey = readonly ['exchangeRates', 'USD'];

const getExchangeRates = async () => {
  const { data } = await exchangeRateClient.get<ExchangeRateResponse>('/USD');
  return data;
};

export const GetExchangeRateQueryOptions = () =>
  queryOptions({
    queryKey: ['exchangeRates', 'USD'] as GetExchangeRateQueryKey,
    queryFn: getExchangeRates,
    staleTime: QUERY_TIMINGS.hourly.staleTime,
    refetchInterval: QUERY_TIMINGS.hourly.refetchInterval,
    gcTime: QUERY_TIMINGS.hourly.gcTime,
  });
