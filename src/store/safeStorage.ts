import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => {
      store[key] = value;
      return value;
    },
    removeItem: async (key: string) => {
      delete store[key];
    },
  };
};

const canUseStorage = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__orion_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const baseStorage = canUseStorage() ? createWebStorage('local') : createNoopStorage();

const isQuotaError = (error: unknown) => {
  if (error instanceof DOMException) {
    return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
  }
  return false;
};

export const safeStorage = {
  getItem: async (key: string) => {
    try {
      const value = await baseStorage.getItem(key);
      if (!value) {
        return null;
      }
      try {
        JSON.parse(value);
        return value;
      } catch {
        // Corrupted data: ignore and fall back to fresh state.
        // eslint-disable-next-line no-console
        console.warn('Persisted state is corrupted. Resetting storage.');
        return null;
      }
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      return await baseStorage.setItem(key, value);
    } catch (error) {
      if (isQuotaError(error)) {
        // eslint-disable-next-line no-console
        console.warn('Storage quota exceeded. Skipping persistence.');
        return value;
      }
      return value;
    }
  },
  removeItem: async (key: string) => {
    try {
      await baseStorage.removeItem(key);
    } catch {
      // Ignore removal errors for disabled storage.
    }
  },
};
