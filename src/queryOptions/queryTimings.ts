export const QUERY_TIMINGS = {
  realtime: {
    staleTime: 50_000,
    gcTime: 60_000,
    refetchInterval: 60_000,
  },
  hourly: {
    staleTime: 55 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  },
  search: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  daily: {
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  },
} as const;
