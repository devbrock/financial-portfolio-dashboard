import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../apiError';
import { applyApiErrorHandling } from '../withErrorHandling';

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
  },
}));

describe('withErrorHandling', () => {
  it('retries on 429 and resolves', async () => {
    vi.useFakeTimers();
    let calls = 0;

    const client = axios.create({
      adapter: async config => {
        calls += 1;
        if (calls < 2) {
          return Promise.reject({
            config,
            response: { status: 429, headers: {} },
          });
        }
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });

    applyApiErrorHandling(client, 'Test API');
    const promise = client.get('/test');
    await vi.runAllTimersAsync();
    const response = await promise;

    expect(response.data.ok).toBe(true);
    expect(calls).toBe(2);
    vi.useRealTimers();
  });

  it('respects retry-after headers', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const retryAfter = new Date(Date.now() + 2000).toUTCString();

    const client = axios.create({
      adapter: async config => {
        calls += 1;
        if (calls < 2) {
          return Promise.reject({
            config,
            response: { status: 429, headers: { 'retry-after': retryAfter } },
          });
        }
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });

    applyApiErrorHandling(client, 'Test API');
    const promise = client.get('/test');
    await vi.runAllTimersAsync();
    const response = await promise;

    expect(response.data.ok).toBe(true);
    expect(calls).toBe(2);
    vi.useRealTimers();
  });

  it('retries network errors without a response', async () => {
    vi.useFakeTimers();
    let calls = 0;

    const client = axios.create({
      adapter: async config => {
        calls += 1;
        if (calls < 2) {
          return Promise.reject({
            config,
            code: 'ENETDOWN',
          });
        }
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });

    applyApiErrorHandling(client, 'Test API');
    const promise = client.get('/test');
    await vi.runAllTimersAsync();
    const response = await promise;

    expect(response.data.ok).toBe(true);
    expect(calls).toBe(2);
    vi.useRealTimers();
  });

  it('rejects with ApiError after max retries', async () => {
    vi.useFakeTimers();
    let calls = 0;

    const client = axios.create({
      adapter: async config => {
        calls += 1;
        return Promise.reject({
          config,
          response: { status: 500, headers: {} },
        });
      },
    });

    applyApiErrorHandling(client, 'Test API');
    const promise = client.get('/test');
    void promise.catch(() => undefined);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    expect(calls).toBeGreaterThan(1);
    vi.useRealTimers();
  });
});
