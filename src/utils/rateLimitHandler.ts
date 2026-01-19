export interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const defaultRateLimitConfig: RateLimitConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

export function calculateBackoffDelay(
  attempt: number,
  config: RateLimitConfig = defaultRateLimitConfig
): number {
  const delay = config.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelayMs);
}

export function isRateLimitError(status: number | undefined): boolean {
  return status === 429;
}
