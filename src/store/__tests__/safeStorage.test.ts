import { describe, expect, it, vi, beforeEach } from 'vitest';

type StorageShape = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<string>;
  removeItem: (key: string) => Promise<void>;
};

let mockStorage: StorageShape;

vi.mock('redux-persist/lib/storage/createWebStorage', () => ({
  default: () => mockStorage,
}));

describe('safeStorage', () => {
  beforeEach(() => {
    vi.resetModules();
    mockStorage = {
      getItem: vi.fn(async () => null),
      setItem: vi.fn(async (_key: string, value: string) => value),
      removeItem: vi.fn(async () => undefined),
    };
  });

  it('returns null for corrupted JSON values', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockStorage.getItem = vi.fn(async () => 'not-json');

    const { safeStorage } = await import('../safeStorage');
    const value = await safeStorage.getItem('persist:root');

    expect(value).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns stored JSON values when valid', async () => {
    mockStorage.getItem = vi.fn(async () => '{\"ok\":true}');

    const { safeStorage } = await import('../safeStorage');
    const value = await safeStorage.getItem('persist:root');

    expect(value).toBe('{\"ok\":true}');
  });

  it('returns null when storage throws', async () => {
    mockStorage.getItem = vi.fn(async () => {
      throw new Error('read error');
    });

    const { safeStorage } = await import('../safeStorage');
    const value = await safeStorage.getItem('persist:root');

    expect(value).toBeNull();
  });

  it('swallows quota errors on setItem', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockStorage.setItem = vi.fn(async () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { safeStorage } = await import('../safeStorage');
    const result = await safeStorage.setItem('persist:root', '{"ok":true}');

    expect(result).toBe('{"ok":true}');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ignores removeItem errors', async () => {
    mockStorage.removeItem = vi.fn(async () => {
      throw new Error('fail');
    });

    const { safeStorage } = await import('../safeStorage');
    await expect(safeStorage.removeItem('persist:root')).resolves.toBeUndefined();
  });

  it('uses noop storage when window is unavailable', async () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - simulate non-browser environment.
    delete globalThis.window;

    vi.resetModules();
    const { safeStorage } = await import('../safeStorage');

    await safeStorage.setItem('key', '\"value\"');
    const value = await safeStorage.getItem('key');
    expect(value).toBe('\"value\"');

    globalThis.window = originalWindow;
  });
});
