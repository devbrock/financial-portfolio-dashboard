import { describe, expect, it } from 'vitest';
import { ApiError, getUserFacingMessage } from '../apiError';

describe('apiError', () => {
  it('creates ApiError with status', () => {
    const error = new ApiError('message', 418);
    expect(error.message).toBe('message');
    expect(error.status).toBe(418);
  });

  it('returns user-facing messages by status', () => {
    expect(getUserFacingMessage(undefined, true)).toMatch(/Network error/i);
    expect(getUserFacingMessage(429)).toMatch(/rate limited/i);
    expect(getUserFacingMessage(503)).toMatch(/service is having trouble/i);
    expect(getUserFacingMessage(400)).toMatch(/check your input/i);
    expect(getUserFacingMessage()).toMatch(/complete that request/i);
  });
});
