import { describe, expect, it } from 'vitest';
import { calculateBackoffDelay, isRateLimitError } from '../rateLimitHandler';

describe('rateLimitHandler', () => {
  it('calculates exponential backoff with cap', () => {
    expect(calculateBackoffDelay(0)).toBe(1000);
    expect(calculateBackoffDelay(1)).toBe(2000);
    expect(calculateBackoffDelay(4)).toBe(16000);
    expect(calculateBackoffDelay(10)).toBe(30000);
  });

  it('detects rate limit status', () => {
    expect(isRateLimitError(429)).toBe(true);
    expect(isRateLimitError(500)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });
});
