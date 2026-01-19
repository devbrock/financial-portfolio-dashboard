import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError, getUserFacingMessage } from "./apiError";
import { toast } from "sonner";
import {
  calculateBackoffDelay,
  defaultRateLimitConfig,
  isRateLimitError,
} from "@/utils/rateLimitHandler";

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const RATE_LIMIT_TOAST_COOLDOWN_MS = 10000;
let lastRateLimitToastAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfter = (value: string | undefined) => {
  if (!value) return null;
  const seconds = Number.parseInt(value, 10);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }
  const date = Date.parse(value);
  if (!Number.isNaN(date)) {
    return Math.max(date - Date.now(), 0);
  }
  return null;
};

const isNetworkError = (error: AxiosError) =>
  !error.response && error.code !== "ECONNABORTED";

const shouldRetry = (error: AxiosError) => {
  const status = error.response?.status;
  if (isRateLimitError(status)) return true;
  if (status && status >= 500 && status < 600) return true;
  return isNetworkError(error);
};

const getRetryDelay = (error: AxiosError, retryCount: number) => {
  const retryAfter = parseRetryAfter(
    error.response?.headers?.["retry-after"]
  );
  if (retryAfter !== null) {
    return retryAfter;
  }
  if (isRateLimitError(error.response?.status)) {
    return calculateBackoffDelay(retryCount - 1, defaultRateLimitConfig);
  }
  return Math.min(BASE_DELAY_MS * 2 ** (retryCount - 1), 30000);
};

const toApiError = (error: AxiosError) => {
  const status = error.response?.status;
  const userMessage = getUserFacingMessage(status, isNetworkError(error));
  return new ApiError(userMessage, status);
};

export const applyApiErrorHandling = (
  client: AxiosInstance,
  apiName?: string
) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (!config || !shouldRetry(error)) {
        return Promise.reject(toApiError(error));
      }

      const retryCount = (config.__retryCount ?? 0) + 1;
      config.__retryCount = retryCount;

      if (retryCount > MAX_RETRIES) {
        return Promise.reject(toApiError(error));
      }

      if (isRateLimitError(error.response?.status)) {
        const now = Date.now();
        if (now - lastRateLimitToastAt > RATE_LIMIT_TOAST_COOLDOWN_MS) {
          lastRateLimitToastAt = now;
          if (typeof window !== "undefined") {
            toast.warning(
              `${apiName ?? "API"} rate limited. Retrying shortly...`
            );
          }
        }
      }

      const delay = getRetryDelay(error, retryCount);
      await sleep(delay);
      return client.request(config);
    }
  );
};
