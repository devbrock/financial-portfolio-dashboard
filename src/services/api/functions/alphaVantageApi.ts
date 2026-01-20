import type { AlphaVantageTimeSeriesDaily, AlphaVantageTimeSeriesMonthly } from '@/types/alphaVantage';
import { alphaVantageClient } from '@/services/api/clients/alphaVantageClient';
import { ApiError } from '@/services/api/clients/apiError';

const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;
let requestQueue: Promise<unknown> = Promise.resolve();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const enqueueAlphaVantage = async <T>(fn: () => Promise<T>) => {
  const task = async () => {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - now);
    if (wait > 0) {
      await sleep(wait);
    }
    lastRequestAt = Date.now();
    return fn();
  };

  const run = requestQueue.then(task);
  requestQueue = run.catch(() => undefined);
  return run;
};

const isRateLimitResponse = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  return 'Information' in data || 'Note' in data || 'Error Message' in data;
};

/* Type-safe API functions */
export const alphaVantageApi = {
  getTimeSeriesDaily: async (symbol: string, outputsize: 'compact' | 'full' = 'compact') => {
    return enqueueAlphaVantage(async () => {
      const response = await alphaVantageClient.get<AlphaVantageTimeSeriesDaily>('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          outputsize,
        },
      });

      if (isRateLimitResponse(response.data)) {
        throw new ApiError('Alpha Vantage rate limit reached. Retrying shortly.', 429);
      }

      return response;
    });
  },

  getTimeSeriesMonthly: async (symbol: string) => {
    return enqueueAlphaVantage(async () => {
      const response = await alphaVantageClient.get<AlphaVantageTimeSeriesMonthly>('', {
        params: {
          function: 'TIME_SERIES_MONTHLY',
          symbol,
        },
      });

      if (isRateLimitResponse(response.data)) {
        throw new ApiError('Alpha Vantage rate limit reached. Retrying shortly.', 429);
      }

      return response;
    });
  },
};
