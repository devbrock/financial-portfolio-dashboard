import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetEarningsCalendarQueryOptions } from '@/queryOptions/GetEarningsCalendarQueryOptions';

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export function useEarningsCalendar(days: number) {
  const range = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + days);
    return {
      from: toDateKey(start),
      to: toDateKey(end),
    };
  }, [days]);

  const query = useQuery({
    ...GetEarningsCalendarQueryOptions(range.from, range.to),
    refetchInterval: 60 * 60 * 1000,
    staleTime: 55 * 60 * 1000,
  });

  return {
    data: query.data?.earningsCalendar ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    dataUpdatedAt: query.dataUpdatedAt ?? 0,
  };
}
