import { queryOptions } from '@tanstack/react-query';
import { finnhubApi } from '@/services/api/functions/finnhubApi';
import { ApiError } from '@/services/api/clients/apiError';

export type GetEarningsCalendarQueryKey = readonly ['earningsCalendar', string, string];

const getEarningsCalendar = async (from: string, to: string) => {
  const { data } = await finnhubApi.getEarningsCalendar(from, to);
  return data;
};

export const GetEarningsCalendarQueryOptions = (from: string, to: string) => {
  return queryOptions({
    queryKey: ['earningsCalendar', from, to] as GetEarningsCalendarQueryKey,
    queryFn: () => getEarningsCalendar(from, to),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 300000,
  });
};
